// src/components/FilterBar.jsx
import React, { useState } from 'react';
import { getFilteredAnalysis } from '../api';

export default function FilterBar({ taskId, onFilterApplied }) {
  const [filterExpr, setFilterExpr] = useState('');
  const [loading, setLoading] = useState(false);

  const applyFilter = async () => {
    if (!filterExpr.trim()) {
      onFilterApplied(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getFilteredAnalysis(taskId, filterExpr);
      onFilterApplied(res.data);
    } catch (err) {
      alert('Filter error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setFilterExpr('');
    onFilterApplied(null);
  };

  return (
    <div className="bg-base-100 p-3 rounded-lg shadow-md my-2">
      <h3 className="font-semibold text-sm mb-2">🔍 Filter Data</h3>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={filterExpr}
          onChange={e => setFilterExpr(e.target.value)}
          placeholder="e.g., age > 30 AND city == 'NYC'"
          className="input input-sm input-bordered flex-1"
        />
        <button onClick={applyFilter} disabled={loading} className="btn btn-sm btn-primary">
          {loading ? 'Applying...' : 'Apply'}
        </button>
        <button onClick={clearFilter} className="btn btn-sm btn-ghost">Clear</button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Use AND, OR, ==, !=,{">"}, {"<"}, etc.</p>
    </div>
  );
}