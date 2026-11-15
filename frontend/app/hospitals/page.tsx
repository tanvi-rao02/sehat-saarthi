'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const FILTERS = ['hospital', 'clinic', 'pharmacy', 'doctor'];
const esc = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export default function HospitalsPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [filter, setFilter] = useState('hospital');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      p => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLoc({ lat: 28.6139, lng: 77.209 })
    );
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!loc) return;
    setLoading(true); setError('');
    fetch(`${API}/hospitals/nearby?lat=${loc.lat}&lng=${loc.lng}&type=${filter}`)
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then(d => setPlaces(d.hospitals || []))
      .catch(e => setError(e.message || 'Could not load places.'))
      .finally(() => setLoading(false));
  }, [loc, filter, API]);

  useEffect(() => {
    if (!loc || !mapDiv.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapDiv.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(mapDiv.current).setView([loc.lat, loc.lng], 14);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }
      layerRef.current.clearLayers();
      L.circleMarker([loc.lat, loc.lng], { radius: 9, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 })
        .bindPopup('You are here').addTo(layerRef.current);
      places.forEach(p =>
        L.circleMarker([p.location.lat, p.location.lng], { radius: 8, color: '#fff', weight: 2, fillColor: '#0d9488', fillOpacity: 1 })
          .bindPopup(`<b>${esc(p.name)}</b><br/>${esc(p.address)}`)
          .addTo(layerRef.current)
      );
    })();
    return () => { cancelled = true; };
  }, [loc, places]);

  const dirUrl = (p: any) =>
    `https://www.google.com/maps/dir/?api=1&destination=${p.location.lat},${p.location.lng}`;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div ref={mapDiv} style={{ flex: 1 }} />
      <div style={{ width: 360, display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid #e2e8f0' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
            <a href="/" style={{ color: '#64748b', textDecoration: 'none' }}>←</a>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Nearby Facilities</h2>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 12px', borderRadius: 20, border: '1.5px solid', fontSize: 12, cursor: 'pointer',
                background: filter === f ? '#0d9488' : '#fff', color: filter === f ? '#fff' : '#64748b',
                borderColor: filter === f ? '#0d9488' : '#e2e8f0',
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loading && <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 24 }}>Finding nearby {filter}s…</p>}
          {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
          {!loading && !error && places.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 24 }}>None found nearby. Try another filter.</p>
          )}
          {places.map(p => (
            <div key={p.id} onClick={() => mapRef.current?.setView([p.location.lat, p.location.lng], 16)}
              style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, marginBottom: 10, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <h3 style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</h3>
                <span style={{ fontSize: 12, color: '#0d9488', whiteSpace: 'nowrap' }}>{p.distanceKm} km</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 10px' }}>{p.address}</p>
              {p.emergency && <span style={{ fontSize: 11, background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: 10 }}>Emergency</span>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <a href={dirUrl(p)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  style={{ padding: '6px 14px', background: '#0d9488', color: '#fff', borderRadius: 8, fontSize: 12, textDecoration: 'none' }}>Directions</a>
                {p.phone && (
                  <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()}
                    style={{ padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#1e293b', textDecoration: 'none' }}>Call</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
