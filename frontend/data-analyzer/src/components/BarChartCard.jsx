// src/components/BarChartCard.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarChartCard({ column, data, compact = false }) {
  if (!data) return null;
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  const height = compact ? 180 : 300;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-3">
        <h2 className="card-title text-sm font-semibold truncate">{column}</h2>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 8 }} />
            <YAxis width={30} tick={{ fontSize: 8 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}