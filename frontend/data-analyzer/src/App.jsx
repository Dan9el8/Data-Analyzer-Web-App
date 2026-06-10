// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard/:taskId" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;