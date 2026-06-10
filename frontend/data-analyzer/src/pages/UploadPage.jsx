// src/pages/UploadPage.jsx
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  ReactFlow,
  Background,
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { uploadFile } from '../api';
import toast from 'react-hot-toast';

// Initial workflow nodes (with remove buttons)
const initialNodes = [
  {
    id: '1',
    type: 'input',
    position: { x: 100, y: 100 },
    data: {
      label: (
        <div className="relative">
          <div className="font-bold"> Upload Dataset</div>
          <div className="text-xs text-gray-300">CSV, Excel, JSON</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Removal handled by parent
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 z-10"
          >
            ✕
          </button>
        </div>
      ),
    },
  },
  {
    id: '2',
    position: { x: 300, y: 100 },
    data: {
      label: (
        <div className="relative">
          <div className="font-bold"> Clean & Analyze</div>
          <div className="text-xs text-gray-300">Pandas + NumPy</div>
          <button className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 z-10">
            ✕
          </button>
        </div>
      ),
    },
  },
  {
    id: '3',
    position: { x: 500, y: 100 },
    data: {
      label: (
        <div className="relative">
          <div className="font-bold">Generate Visuals</div>
          <div className="text-xs text-gray-300">Histograms, Scatter, Box plots</div>
          <button className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 z-10">
            ✕
          </button>
        </div>
      ),
    },
  },
  {
    id: '4',
    type: 'output',
    position: { x: 700, y: 100 },
    data: {
      label: (
        <div className="relative">
          <div className="font-bold"> Export Report</div>
          <div className="text-xs text-gray-300">PDF / HTML</div>
          <button className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 z-10">
            ✕
          </button>
        </div>
      ),
    },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: '3', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node removal (the close button)
  const onNodeRemove = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    toast.success(`Removed node ${nodeId}`, { icon: '🗑️' });
  }, [setNodes, setEdges]);

  // Attach remove handlers to each node's button after nodes change
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        // Create a new label that calls onNodeRemove when its ✕ button is clicked
        const originalLabel = node.data.label;
        return {
          ...node,
          data: {
            ...node.data,
            label: (
              <div className="relative">
                {originalLabel.props.children[0]}
                {originalLabel.props.children[1]}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeRemove(node.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 z-10"
                >
                  ✕
                </button>
              </div>
            ),
          },
        };
      })
    );
  }, [onNodeRemove, setNodes]);

  const onDrop = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    setUploading(true);
    try {
      const res = await uploadFile(formData);
      toast.success('Upload successful! Redirecting...');
      navigate(`/dashboard/${res.data.task_id}`);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white overflow-x-hidden">
      {/* Navbar – same as DashboardPage */}
      <header className="relative z-50 border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              DataFlow
            </h1>
          </div>
          <nav className="hidden md:flex gap-8 text-gray-400">
            <a href="#" className="hover:text-white transition">Features</a>
            <a href="#" className="hover:text-white transition">Docs</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column – Upload zone */}
          <div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Upload Your Dataset
            </h1>
            <p className="text-gray-400 mb-8">
              Support for CSV, Excel (XLS/XLSX) – up to 100MB.
              Your data stays private and is processed asynchronously.
            </p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 hover:border-cyan-500/50'}
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4">📂</div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your file here' : 'Drag & drop or click to select'}
              </p>
              <p className="text-sm text-gray-500 mt-2">CSV or Excel files only</p>
            </div>

            {uploading && (
              <div className="mt-6 text-center">
                <div className="loading loading-spinner loading-md text-cyan-500"></div>
                <p className="mt-2 text-gray-400">Uploading and starting analysis...</p>
              </div>
            )}
          </div>

          {/* Right column – React Flow Workflow with removable nodes */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-4 overflow-hidden">
            <h2 className="text-lg font-semibold mb-2 text-gray-200">Your Data Pipeline</h2>
            <div style={{ height: '400px', width: '100%' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                className="bg-[#0f0f12] rounded-lg"
                proOptions={{ hideAttribution: true }}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
              >
                <Background gap={20} size={1} color="#333" />
              </ReactFlow>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Click the ✕ button on any node to remove it from the pipeline
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}