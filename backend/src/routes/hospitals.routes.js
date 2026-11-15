const router = require('express').Router();

const TAGS = { hospital: 'hospital', clinic: 'clinic', pharmacy: 'pharmacy', doctor: 'doctors' };
const cache = new Map();
const TTL = 10 * 60 * 1000;

const km = (a, b, c, d) => {
  const r = x => (x * Math.PI) / 180;
  const h = Math.sin(r(c - a) / 2) ** 2 +
    Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = Math.min(parseInt(req.query.radius) || 5000, 15000);
    const type = req.query.type || 'hospital';
    const tag = TAGS[type];

    if (Number.isNaN(lat) || Number.isNaN(lng) || !tag)
      return res.status(400).json({ message: 'Valid lat, lng and type are required.' });

    const key = `${lat.toFixed(2)},${lng.toFixed(2)},${tag},${radius}`;
    let elements;
    const hit = cache.get(key);

    if (hit && Date.now() - hit.time < TTL) {
      elements = hit.elements;
    } else {
      const query = `[out:json][timeout:25];(node["amenity"="${tag}"](around:${radius},${lat},${lng});way["amenity"="${tag}"](around:${radius},${lat},${lng}););out center tags 40;`;
      const r = await fetch('https://overpass.private.coffee/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SehatSaarthi/1.0 (student project)',
        },
        body: 'data=' + encodeURIComponent(query),
      });
      if (!r.ok) {
  const errorText = await r.text();
  console.error('OVERPASS ERROR:', r.status, errorText.slice(0, 500));
  return res.status(502).json({ message: 'Map data service is busy. Try again shortly.' });
}
      elements = (await r.json()).elements || [];
      cache.set(key, { time: Date.now(), elements });
    }

    const hospitals = elements
      .map(e => {
        const t = e.tags || {};
        const pLat = e.lat ?? e.center?.lat;
        const pLng = e.lon ?? e.center?.lon;
        if (pLat == null || pLng == null) return null;
        const address = [t['addr:housenumber'], t['addr:street'], t['addr:suburb'] || t['addr:city']]
          .filter(Boolean).join(', ');
        return {
          id: `${e.type}-${e.id}`,
          name: t.name || t['name:en'] || `Unnamed ${type}`,
          address: address || 'Address not listed',
          phone: t.phone || t['contact:phone'] || null,
          openingHours: t.opening_hours || null,
          emergency: t.emergency === 'yes',
          location: { lat: pLat, lng: pLng },
          distanceKm: +km(lat, lng, pLat, pLng).toFixed(2),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ hospitals, total: hospitals.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
