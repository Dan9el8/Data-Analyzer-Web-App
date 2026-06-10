import { Link } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodes = [
  {
    id: '1',
    type: 'input',
    position: { x: 650, y: 260 },
    data: {
      label: (
        <>
          <div style={{color: 'black', fontSize: '12px' }}>
            📂 Upload Dataset
          </div>
          <div style={{color: 'black',  fontSize: '12px' }}>
            CSV, Excel, JSON
          </div>
        </>
      ),
    },
  },

  {
    id: '2',
    position: { x: 930, y: 120 },
    data: {
      label: (
        <>
          <div style={{color: 'black'}}>🧹 Clean Data</div>
          <div style={{color: 'black',  fontSize: '12px' }}>
            Remove duplicates and null values
          </div>
        </>
      ),
    },
  },

  {
    id: '3',
    position: { x: 930, y: 400 },
    data: {
      label: (
        <>
          <div style={{color: 'black'}}>📊 Statistical Analysis</div>
          <div style={{color: 'black', fontSize: '12px' }}>
            Correlations, trends and distributions
          </div>
        </>
      ),
    },
  },

  {
    id: '4',
    position: { x: 1250, y: 260 },
    data: {
      label: (
        <>
          <div style={{color: 'black'}}>📈 Generate Charts</div>
          <div style={{color: 'black', fontSize: '12px' }}>
            Bar, Line, Scatter and Histogram charts
          </div>
        </>
      ),
    },
  },

  {
    id: '5',
    position: { x: 1570, y: 260 },
    data: {
      label: (
        <>
          <div style={{color: 'black'}}>🤖 AI Insights</div>
          <div style={{color: 'black', fontSize: '12px' }}>
            Detect anomalies and hidden patterns
          </div>
        </>
      ),
    },
  },

  {
    id: '6',
    type: 'output',
    position: { x: 1890, y: 260 },
    data: {
      label: (
        <>
          <div style={{color: 'black'}}>📄 Export Report</div>
          <div style={{color: 'black', fontSize: '12px' }}>
            Download PDF, Excel and Dashboard
          </div>
        </>
      ),
    },
  },
];

const edges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },

  {
    id: 'e1-3',
    source: '1',
    target: '3',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },

  {
    id: 'e2-4',
    source: '2',
    target: '4',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },

  {
    id: 'e3-4',
    source: '3',
    target: '4',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },

  {
    id: 'e4-5',
    source: '4',
    target: '5',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },

  {
    id: 'e5-6',
    source: '5',
    target: '6',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

export default function Homepage() {
  return (
    <div className="min-h-screen bg-[#0f0f12] text-white overflow-hidden">
      {/* Navbar */}
      <header className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              DataFlow
            </h1>
          </div>

          <nav className="hidden md:flex gap-8 text-gray-400">
            <a href="#">Features</a>
            <a href="#">Docs</a>
            <a href="#">GitHub</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[calc(100vh-80px)]">
        {/* React Flow Background */}
        <div className="absolute inset-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{
              padding: 0.2,
            }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            proOptions={{
              hideAttribution: true,
            }}
            className="bg-[#0f0f12]"
          >
            <Background
              gap={24}
              size={1}
              color=""
            />
          </ReactFlow>
        </div>

        {/* Dark fade behind text */}
        <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-gradient-to-r from-[#0f0f12] via-[#0f0f12]/95 to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-6">
          <div className="grid lg:grid-cols-2 h-full items-center">
            {/* LEFT */}
            <div className="max-w-xl">
              <div className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-6 py-2 text-sm text-cyan-400 mt- -6">
                Get visual insights from your data in seconds
              </div>

              <h1 className="mt-8 text-2xl lg:text-6xl font-black leading-none tracking-tight">
                Analyze your data visually with
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Dataflow
                </span>
              </h1>

              <div className="flex gap-4 mt-10">
                <Link
                  to="/upload"
                  className="px-8 py-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
                >
                  Start Analyzing
                </Link>
              </div>

              <div className="flex gap-10 mt-14">
                <div>
                  <h3 className="text-3xl font-bold">
                    1M+
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Rows Processed
                  </p>
                </div>

                

                
              </div>
            </div>

            {/* RIGHT COLUMN EMPTY */}
            <div />
          </div>
        </div>
      </section>
    </div>
  );
}