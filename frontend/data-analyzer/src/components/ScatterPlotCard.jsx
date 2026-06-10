// src/components/ScatterPlotCard.jsx
import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getScatterData } from '../api';

export default function ScatterPlotCard({ taskId, numericCols, compact = false }) {
  const [xCol, setXCol] = useState(numericCols[0] || '');
  const [yCol, setYCol] = useState(numericCols[1] || numericCols[0] || '');
  const [data, setData] = useState([]);

  useEffect(() => {
    if (taskId && xCol && yCol) {
      getScatterData(taskId, xCol, yCol).then(res => setData(res.data.data)).catch(console.error);
    }
  }, [taskId, xCol, yCol]);

  const height = compact ? 200 : 400;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-3">
        <h2 className="card-title text-sm">📈 Scatter Plot</h2>
        <div className="flex gap-2 text-xs">
          <select className="select select-xs" value={xCol} onChange={e => setXCol(e.target.value)}>
            {numericCols.map(col => <option key={col}>{col}</option>)}
          </select>
          <select className="select select-xs" value={yCol} onChange={e => setYCol(e.target.value)}>
            {numericCols.map(col => <option key={col}>{col}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name={xCol} tick={{ fontSize: 8 }} />
            <YAxis dataKey="y" name={yCol} tick={{ fontSize: 8 }} />
            <Tooltip />
            <Scatter data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}