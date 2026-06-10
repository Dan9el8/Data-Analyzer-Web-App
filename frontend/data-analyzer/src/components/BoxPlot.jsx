import React, { useState, useEffect } from 'react';
import { getBoxplotData } from '../api';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Rectangle } from 'recharts';

export default function BoxPlot({ taskId, numericCols, categoricalCols, filterStr }) {
  const [numCol, setNumCol] = useState(numericCols[0] || '');
  const [catCol, setCatCol] = useState(categoricalCols[0] || '');
  const [data, setData] = useState([]);

  useEffect(() => {
    if (taskId && numCol && catCol) {
      getBoxplotData(taskId, numCol, catCol, filterStr)
        .then(res => setData(res.data))
        .catch(console.error);
    }
  }, [taskId, numCol, catCol, filterStr]);

  // Transform to recharts format (each box needs min, q1, median, q3, max)
  const chartData = data.map(item => ({
    name: item.category,
    min: item.min,
    q1: item.q1,
    median: item.median,
    q3: item.q3,
    max: item.max
  }));

  // Custom box renderer (simplified – you can refine)
  const CustomBox = (props) => {
    const { x, y, width, payload } = props;
    const { min, q1, median, q3, max } = payload;
    const yScale = (value) => y + (1 - (value - min)/(max - min)) * 100; // dummy scaling
    return (
      <g>
        <Rectangle x={x} y={yScale(q3)} width={width} height={yScale(q1)-yScale(q3)} fill="#8884d8" />
        <Line x1={x} x2={x+width} y1={yScale(median)} y2={yScale(median)} stroke="black" />
      </g>
    );
  };

  return (
    <div>
      <label>Numeric Column: </label>
      <select value={numCol} onChange={e => setNumCol(e.target.value)}>
        {numericCols.map(col => <option key={col}>{col}</option>)}
      </select>
      <label> Category: </label>
      <select value={catCol} onChange={e => setCatCol(e.target.value)}>
        {categoricalCols.map(col => <option key={col}>{col}</option>)}
      </select>
      <ComposedChart width={600} height={400} data={chartData}>
        <CartesianGrid />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {/* For simplicity, we show only min/max lines; a full box plot requires custom shape */}
        <Line type="monotone" dataKey="min" stroke="red" />
        <Line type="monotone" dataKey="max" stroke="red" />
        <Line type="monotone" dataKey="median" stroke="blue" />
      </ComposedChart>
      <p><em>Note: For complete box plots (whiskers & box), consider using a dedicated library like 'react-boxplot'.</em></p>
    </div>
  );
}