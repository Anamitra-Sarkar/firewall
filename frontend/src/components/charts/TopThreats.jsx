import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#f43f5e','#f97316','#06b6d4','#6366f1','#a855f7'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'rgba(255,255,255,0.98)',
      border:'1px solid rgba(6,182,212,0.2)',
      borderRadius:10, padding:'10px 14px',
      boxShadow:'0 8px 24px rgba(15,23,42,0.12)',
    }}>
      <p style={{ fontSize:13, fontWeight:700, color: payload[0].payload.fill || '#0f172a', margin:0 }}>
        {payload[0].name}: <span style={{ color:'#0f172a' }}>{payload[0].value}%</span>
      </p>
    </div>
  );
};

export default function TopThreats({ threats }) {
  const buildData = () => {
    const counts = {};
    if (Array.isArray(threats) && threats.length > 0) {
      threats.forEach((t) => {
        const type = t.threat_type || t.type || 'Unknown';
        counts[type] = (counts[type] || 0) + 1;
      });
      const total = Object.values(counts).reduce((a,b) => a+b, 0);
      return Object.entries(counts)
        .sort((a,b) => b[1]-a[1])
        .slice(0,5)
        .map(([name,val]) => ({ name, value: Math.round((val/total)*100) }));
    }
    return [];
  };

  const data    = buildData();
  const hasData = data.length > 0;

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>Threat Distribution</h2>
        <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>Breakdown by type — live from extension</p>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={55} outerRadius={90}
              paddingAngle={4} dataKey="value"
              label={({ name, value }) => `${name} ${value}%`}
              labelLine={{ stroke:'#94a3b8', strokeWidth:1 }}
            >
              {data.map((_,index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12, color:'#475569', paddingTop:8 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'32px 20px', textAlign:'center',
          background:'linear-gradient(135deg, rgba(6,182,212,0.04), rgba(99,102,241,0.04))',
          borderRadius:14, border:'1.5px dashed rgba(6,182,212,0.25)', minHeight:200,
        }}>
          <div style={{ fontSize:32, marginBottom:10 }}>📊</div>
          <p style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:0 }}>No threats detected yet</p>
          <p style={{ fontSize:13, color:'#64748b', margin:'6px 0 0', maxWidth:300, lineHeight:1.6 }}>
            Threat type distribution will appear here once the extension starts reporting data.
          </p>
        </div>
      )}
    </div>
  );
}
