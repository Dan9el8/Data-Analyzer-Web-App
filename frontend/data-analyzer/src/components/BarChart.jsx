import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function BarChartComponent({ column, data }) {
  if (!data) return null;
  const chartData = Object.entries(data).map(([key, value]) => ({ name: key, value }));
  return (
    <div style={{ marginBottom: '30px' }}>
      <h4>{column}</h4>
      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </div>
  );
}