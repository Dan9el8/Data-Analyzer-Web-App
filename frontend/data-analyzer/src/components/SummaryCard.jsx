// src/components/SummaryCard.jsx
export default function SummaryCard({ results }) {
  const { shape, columns, dtypes, missing, missing_pct, description } = results;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-3">
        <h2 className="card-title text-sm">📋 Dataset Overview</h2>
        <p className="text-xs">Rows: {shape[0]} | Cols: {shape[1]}</p>
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="table table-xs">
            <thead>
              <tr><th>Column</th><th>Type</th><th>Missing</th><th>%</th></tr>
            </thead>
            <tbody>
              {columns.map(col => (
                <tr key={col}>
                  <td className="truncate max-w-[100px]">{col}</td>
                  <td>{dtypes[col]}</td>
                  <td>{missing[col]}</td>
                  <td>{missing_pct[col]}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {Object.keys(description).length > 0 && (
          <>
            <h3 className="text-xs font-bold mt-2">Numeric Stats</h3>
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="table table-xs">
                <thead>
                  <tr><th>Column</th><th>mean</th><th>std</th><th>min</th><th>max</th></tr>
                </thead>
                <tbody>
                  {Object.entries(description).slice(0, 5).map(([col, stats]) => (
                    <tr key={col}>
                      <td className="truncate max-w-[80px]">{col}</td>
                      <td>{stats.mean?.toFixed(2)}</td>
                      <td>{stats.std?.toFixed(2)}</td>
                      <td>{stats.min}</td>
                      <td>{stats.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}