import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ThreatTimeline({ threats }) {
  // Generate timeline data
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      threats: Math.floor(Math.random() * 50) + 10,
      critical: Math.floor(Math.random() * 10) + 1,
    };
  }).reverse();

  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Threat Detection Timeline (7 days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="date" stroke="#a3a3a3" />
          <YAxis stroke="#a3a3a3" />
          <Tooltip
            contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040' }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="threats" fill="#3b82f6" />
          <Bar dataKey="critical" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
