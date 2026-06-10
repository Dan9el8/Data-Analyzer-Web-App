// src/components/SmartChart.jsx
import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter,
  BarChart, Bar,
} from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { getMapData, getScatterData } from '../api';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";

export default function SmartChart({ taskId, analysisResults }) {
  const [chartType, setChartType] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoCol, setGeoCol] = useState(null);

  useEffect(() => {
    determineChartType();
  }, [analysisResults, taskId]);

  const determineChartType = async () => {
    const { columns, numeric_cols, categorical_cols, dtypes } = analysisResults;

    // 1. Check for geographic column (country, state, lat/lon)
    const geoKeywords = ['country', 'nation', 'state', 'province', 'region', 'lat', 'lon', 'latitude', 'longitude'];
    const foundGeoCol = columns.find(col => geoKeywords.some(kw => col.toLowerCase().includes(kw)));
    if (foundGeoCol) {
      setGeoCol(foundGeoCol);
      // Fetch map data (aggregated counts)
      try {
        const res = await getMapData(taskId, foundGeoCol);
        setChartData(res.data);
        setChartType('choropleth');
      } catch (err) {
        console.error(err);
        fallbackChart();
      }
      setLoading(false);
      return;
    }

    // 2. Pie chart: categorical column with <= 10 unique values AND a numeric column (or just counts)
    // For simplicity, use value_counts from analysis
    if (categorical_cols.length > 0) {
      const catCol = categorical_cols[0];
      const counts = analysisResults.value_counts[catCol];
      if (counts && Object.keys(counts).length <= 10) {
        const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));
        setChartData(pieData);
        setChartType('pie');
        setLoading(false);
        return;
      }
    }

    // 3. Time series: check for date/datetime column
    const dateCols = columns.filter(col => 
      ['date', 'time', 'datetime', 'timestamp'].some(k => dtypes[col].toLowerCase().includes(k))
    );
    if (dateCols.length > 0 && numeric_cols.length > 0) {
      // Need time aggregated data – we'll use scatter data endpoint as proxy? Not ideal.
      // For now, fallback to scatter/line only if we have a date column and another numeric.
      // We'll assume we can get time series from frontend? But we'd need aggregated data.
      // Simpler: use line chart with index as date if we had data. We'll skip for brevity.
      // Actually we can reuse scatter endpoint with date as x and numeric as y.
      try {
        const dateCol = dateCols[0];
        const numCol = numeric_cols[0];
        const res = await getScatterData(taskId, dateCol, numCol);
        const lineData = res.data.data.map(d => ({ date: d.x, value: d.y }));
        setChartData(lineData);
        setChartType('line');
      } catch (err) {
        fallbackChart();
      }
      setLoading(false);
      return;
    }

    // 4. Scatter plot if at least 2 numeric cols
    if (numeric_cols.length >= 2) {
      try {
        const res = await getScatterData(taskId, numeric_cols[0], numeric_cols[1]);
        setChartData(res.data.data);
        setChartType('scatter');
      } catch (err) {
        fallbackChart();
      }
      setLoading(false);
      return;
    }

    // 5. Histogram if 1 numeric col
    if (numeric_cols.length === 1) {
      const col = numeric_cols[0];
      const hist = analysisResults.histograms[col];
      if (hist) {
        const histData = hist.counts.map((count, idx) => ({
          range: `${hist.bin_edges[idx].toFixed(1)}–${hist.bin_edges[idx+1].toFixed(1)}`,
          count
        }));
        setChartData(histData);
        setChartType('histogram');
        setLoading(false);
        return;
      }
    }

    // 6. Default bar chart for categorical
    if (categorical_cols.length > 0) {
      const catCol = categorical_cols[0];
      const counts = analysisResults.value_counts[catCol];
      const barData = Object.entries(counts).map(([name, value]) => ({ name, value }));
      setChartData(barData);
      setChartType('bar');
      setLoading(false);
      return;
    }

    // Fallback: nothing to show
    setChartType('none');
    setLoading(false);
  };

  const fallbackChart = () => {
    setChartType('bar');
    setChartData([{ name: 'No data', value: 1 }]);
  };

  if (loading) return <div className="text-center py-10">Analyzing dataset to choose best chart...</div>;
  if (chartType === 'none') return <div className="text-center py-10 text-gray-400">No suitable chart type found for this dataset.</div>;

  const renderChart = () => {
    switch (chartType) {
      case 'choropleth':
        return (
          <div style={{ width: '100%', height: 500 }}>
            <ComposableMap projectionConfig={{ scale: 150 }}>
              <ZoomableGroup>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      const countryData = chartData.find(d => d.id === geo.id);
                      const value = countryData ? countryData.value : 0;
                      const colorScale = scaleLinear().domain([0, Math.max(...chartData.map(d => d.value), 1)]).range(['#ffedea', '#ff5233']);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={value > 0 ? colorScale(value) : '#EEE'}
                          stroke="#FFF"
                          style={{
                            default: { outline: 'none' },
                            hover: { fill: '#F53', outline: 'none' },
                            pressed: { outline: 'none' },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            <p className="text-center text-sm text-gray-500 mt-2">Choropleth map – color intensity represents frequency/sum</p>
          </div>
        );
      case 'pie':
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="x" name="X" />
              <YAxis dataKey="y" name="Y" />
              <Tooltip />
              <Scatter data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'histogram':
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartType === 'histogram' ? 'range' : 'name'} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1a1a24] rounded-xl border border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {chartType === 'choropleth' && '🌍 Geographic Distribution'}
        {chartType === 'pie' && '🥧 Category Distribution'}
        {chartType === 'line' && '📈 Time Series Trend'}
        {chartType === 'scatter' && '🔵 Correlation Scatter Plot'}
        {chartType === 'histogram' && '📊 Histogram'}
        {chartType === 'bar' && '📊 Bar Chart'}
      </h2>
      {renderChart()}
    </div>
  );
}