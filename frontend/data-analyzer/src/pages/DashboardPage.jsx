// src/pages/DashboardPage.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getTaskStatus } from '../api';
import SmartChart from '../components/SmartChart';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { taskId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const poll = async () => {
      try {
        const res = await getTaskStatus(taskId);
        if (res.data.status === 'completed') {
          setAnalysis(res.data.result);
          setLoading(false);
          toast.success('Analysis complete!');
          clearInterval(interval);
        } else if (res.data.status === 'failed') {
          toast.error('Analysis failed');
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    };
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [taskId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-cyan-500"></div>
      </div>
    );
  }

  if (!analysis || !analysis.results) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center">
        <p className="text-red-500">Failed to load analysis results.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white">
      {/* Navbar (same as before) */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            DataFlow
          </h1>
          <nav className="hidden md:flex gap-8 text-gray-400">
            <a href="#" className="hover:text-white">Features</a>
            <a href="#" className="hover:text-white">Docs</a>
            <a href="#" className="hover:text-white">GitHub</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Smart Chart */}
        <SmartChart taskId={taskId} analysisResults={analysis.results} />

        {/* Report Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <a
            href={`http://localhost:8000/report/${taskId}?format=html`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg bg-white text-black font-semibold hover:scale-105 transition"
          >
            📄 HTML Report
          </a>
          <a
            href={`http://localhost:8000/report/${taskId}?format=pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:scale-105 transition"
          >
            📑 PDF Report
          </a>
        </div>
      </main>
    </div>
  );
}