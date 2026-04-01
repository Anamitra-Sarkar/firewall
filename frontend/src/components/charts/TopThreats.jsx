import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function TopThreats({ threats }) {
  const data = [
    { name: 'Malware', value: 35 },
    { name: 'Phishing', value: 28 },
    { name: 'Exploits', value: 20 },
    { name: 'APT', value: 17 },
  ];

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#22c55e'];

  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Threat Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
