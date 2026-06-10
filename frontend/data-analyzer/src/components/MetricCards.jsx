// src/components/MetricCards.jsx
export default function MetricCards({ results }) {
  const { shape, missing_pct, numeric_cols, categorical_cols } = results;
  const missingAvg = Object.values(missing_pct).reduce((a, b) => a + b, 0) / (Object.keys(missing_pct).length || 1);
  return (
    <>
      <div className="stat bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-2">
        <div className="stat-title text-white/70 text-xs">Rows × Cols</div>
        <div className="stat-value text-lg">{shape[0]}×{shape[1]}</div>
      </div>
      <div className="stat bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-2">
        <div className="stat-title text-white/70 text-xs">Missing</div>
        <div className="stat-value text-lg">{missingAvg.toFixed(0)}%</div>
      </div>
      <div className="stat bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-2">
        <div className="stat-title text-white/70 text-xs">Numeric</div>
        <div className="stat-value text-lg">{numeric_cols.length}</div>
      </div>
      <div className="stat bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-2">
        <div className="stat-title text-white/70 text-xs">Categorical</div>
        <div className="stat-value text-lg">{categorical_cols.length}</div>
      </div>
    </>
  );
}