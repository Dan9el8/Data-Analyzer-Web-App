// src/components/BoxPlotCard.jsx
import { useState, useEffect } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBoxplotData } from '../api';

export default function BoxPlotCard({ taskId, numericCols, categoricalCols, compact = false }) {
  const [numCol, setNumCol] = useState(numericCols[0] || '');
  const [catCol, setCatCol] = useState(categoricalCols[0] || '');
  const [data, setData] = useState([]);

  useEffect(() => {
    if (taskId && numCol && catCol) {
      getBoxplotData(taskId, numCol, catCol).then(res => setData(res.data)).catch(console.error);
    }
  }, [taskId, numCol, catCol]);

  const height = compact ? 200 : 400;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-3">
        <h2 className="card-title text-sm">📦 Box Plot</h2>
        <div className="flex gap-2 text-xs">
          <select className="select select-xs" value={numCol} onChange={e => setNumCol(e.target.value)}>
            {numericCols.map(col => <option key={col}>{col}</option>)}
          </select>
          <select className="select select-xs" value={catCol} onChange={e => setCatCol(e.target.value)}>
            {categoricalCols.map(col => <option key={col}>{col}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 8 }} />
            <YAxis tick={{ fontSize: 8 }} />
            <Tooltip />
            <Line type="monotone" dataKey="min" stroke="red" strokeWidth={1} />
            <Line type="monotone" dataKey="max" stroke="red" strokeWidth={1} />
            <Line type="monotone" dataKey="median" stroke="blue" strokeWidth={2} />
            <Line type="monotone" dataKey="q1" stroke="gray" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="q3" stroke="gray" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-center text-gray-500">Min, Q1, Median, Q3, Max</p>
      </div>
    </div>
  );
}