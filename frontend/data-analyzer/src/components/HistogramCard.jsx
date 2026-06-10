// src/components/HistogramCard.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistogramCard({ column, data, compact = false }) {
  if (!data?.bin_edges) return null;
  const chartData = data.counts.map((count, idx) => ({
    range: `${data.bin_edges[idx].toFixed(1)}–${data.bin_edges[idx+1].toFixed(1)}`,
    count
  }));
  const height = compact ? 180 : 300;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-3">
        <h2 className="card-title text-sm font-semibold truncate">{column}</h2>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" angle={-45} textAnchor="end" height={40} tick={{ fontSize: 8 }} />
            <YAxis width={30} tick={{ fontSize: 8 }} />
            <Tooltip contentStyle={{ fontSize: '10px' }} />
            <Bar dataKey="count" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}