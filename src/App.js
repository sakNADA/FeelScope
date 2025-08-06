import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import Topbar from './Components/Topbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Export from './pages/Export';
import Reddit from './pages/Reddit';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';


function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'bg-dark text-white' : 'bg-light text-dark'} style={{ minHeight: '100vh' }}>
      <div className="d-flex min-vh-100">

        <Sidebar darkMode={darkMode} />
        <div className="flex-grow-1">
          <Topbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <div className="p-4">
            <Routes>
              <Route path="/" element={<Dashboard darkMode={darkMode} />} />
              <Route path="/history" element={<History darkMode={darkMode} />} />
              <Route path="/export" element={<Export darkMode={darkMode} />} />
              <Route path="/reddit" element={<Reddit darkMode={darkMode} />} />
            </Routes>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
