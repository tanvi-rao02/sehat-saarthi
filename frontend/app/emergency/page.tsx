'use client';

const CONTACTS = [
  { name: 'Ambulance', num: '108', color: '#ef4444', emoji: '🚑' },
  { name: 'Police', num: '100', color: '#3b82f6', emoji: '🚔' },
  { name: 'Fire Brigade', num: '101', color: '#f97316', emoji: '🚒' },
  { name: 'Disaster Mgmt', num: '108', color: '#8b5cf6', emoji: '⚠️' },
  { name: 'Women Helpline', num: '1091', color: '#ec4899', emoji: '👩' },
  { name: 'Child Helpline', num: '1098', color: '#06b6d4', emoji: '👶' },
];

const FIRST_AID = [
  { title: 'Heart Attack', steps: 'Call 108 immediately. Keep the person calm and still. Loosen tight clothing. If trained and person is unresponsive, begin CPR.' },
  { title: 'Choking', steps: 'Give 5 firm back blows between shoulder blades. Then give 5 abdominal thrusts. Repeat until the object is cleared.' },
  { title: 'Severe Bleeding', steps: 'Apply firm direct pressure with a clean cloth. Elevate the injured area above heart level. Do not remove cloth — add more on top.' },
  { title: 'Burns', steps: 'Cool under running cold water for 10+ minutes. Do NOT use ice, butter, or toothpaste. Cover loosely with clean cloth.' },
  { title: 'Unconscious Person', steps: 'Check breathing. Place in recovery position (on their side). Call 108 immediately.' },
  { title: 'Seizure', steps: 'Clear area of dangers. Do NOT hold the person down. Time the seizure. Call 108 if it lasts over 5 minutes.' },
];

export default function EmergencyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fef2f2', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#ef4444', color: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px' }}>← Back</a>
        <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Emergency</h1>
      </div>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ background: '#ef4444', borderRadius: '20px', padding: '32px 24px', textAlign: 'center', marginBottom: '24px', boxShadow: '0 8px 32px rgba(239,68,68,0.3)' }}>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginBottom: '12px' }}>Medical Emergency? Tap to call now</p>
          <a href="tel:108" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#fff', color: '#ef4444', fontWeight: 700, padding: '16px 36px', borderRadius: '50px', fontSize: '22px', textDecoration: 'none', marginBottom: '12px' }}>📞 108 — Ambulance</a>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '8px' }}>Free · Available 24/7 across India</p>
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>Emergency Numbers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '28px' }}>
          {CONTACTS.map(c => (
            <a key={c.name} href={`tel:${c.num}`} style={{ background: '#fff', borderRadius: '12px', padding: '16px 12px', textAlign: 'center', textDecoration: 'none', border: '1px solid #fee2e2' }}>
              <div style={{ fontSize: '26px', marginBottom: '6px' }}>{c.emoji}</div>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#1e293b', marginBottom: '4px' }}>{c.name}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: c.color }}>{c.num}</div>
            </a>
          ))}
        </div>
        <a href="/hospitals" style={{ display: 'block', background: '#0d9488', color: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none', fontWeight: 600, fontSize: '15px', marginBottom: '28px' }}>🏥 Find Nearest Hospital on Map</a>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: '#1e293b' }}>First Aid Quick Guide</h2>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #fee2e2' }}>
          {FIRST_AID.map((item, i) => (
            <div key={i} style={{ borderLeft: '3px solid #ef4444', paddingLeft: '14px', marginBottom: i < FIRST_AID.length - 1 ? '20px' : 0 }}>
              <h3 style={{ fontWeight: 600, color: '#ef4444', fontSize: '14px', marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.65' }}>{item.steps}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '20px' }}>Always call emergency services first. SehatSaarthi provides educational information only.</p>
      </div>
    </div>
  );
}
