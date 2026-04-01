import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.97)',
      border: '1px solid rgba(6,182,212,0.2)',
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ fontSize: 12, color: p.fill, margin: '2px 0', fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function ThreatTimeline({ threats }) {
  // Build daily timeline from real threat data (from extension)
  const buildData = () => {
    const days = 7;
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[key] = { date: key, threats: 0, critical: 0 };
    }
    if (Array.isArray(threats)) {
      threats.forEach((t) => {
        const d = t.created_at ? new Date(t.created_at) : null;
        if (!d) return;
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (map[key]) {
          map[key].threats += 1;
          if (t.severity === 'critical' || t.severity === 'high') map[key].critical += 1;
        }
      });
    }
    return Object.values(map);
  };

  const data = buildData();
  const hasData = threats && threats.length > 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Threat Detection Timeline</h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Last 7 days — data from your Chrome extension</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#0891b2',
          background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
          padding: '4px 10px', borderRadius: 20,
        }}>7d</span>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
            <XAxis
              dataKey="date" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6,182,212,0.05)' }} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 12 }}
              iconType="circle" iconSize={8}
            />
            <Bar dataKey="threats" name="Total" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="critical" name="Critical" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ExtensionGate
          message="No threat data yet."
          sub="Start browsing with the extension active to see your 7-day threat timeline."
        />
      )}
    </div>
  );
}

function ExtensionGate({ message, sub }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '36px 24px', textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(6,182,212,0.04), rgba(99,102,241,0.04))',
      borderRadius: 14, border: '1.5px dashed rgba(6,182,212,0.25)',
      minHeight: 200,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 14,
        background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.12))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>🛡️</div>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{message}</p>
      <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 16px', maxWidth: 340, lineHeight: 1.6 }}>{sub}</p>
      <a
        href="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '9px 20px', borderRadius: 20,
          background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
          color: 'white', fontSize: 13, fontWeight: 600,
          textDecoration: 'none', boxShadow: '0 4px 14px rgba(6,182,212,0.25)',
          transition: 'opacity 0.18s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        ⬇ Get the Extension
      </a>
    </div>
  );
}
