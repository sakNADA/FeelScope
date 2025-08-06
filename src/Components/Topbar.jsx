import { FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Topbar({ darkMode = false, setDarkMode = () => {} }) {
  const toggleTheme = () => setDarkMode(prev => !prev);

  const topbarStyle = {
    background: darkMode
      ? 'linear-gradient(90deg, #232526 0%, #414345 100%)'
      : 'linear-gradient(90deg, #6c63ff 0%, #9370db 100%)',
    color: '#ffffff',
    transition: 'all 0.3s ease',
    borderBottom: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    borderRadius: '0 0 24px 24px',
    zIndex: 100,
    minHeight: 70,
  };

  return (
    <motion.div
      className="d-flex justify-content-between align-items-center px-4 py-3 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={topbarStyle}
    >
      <h2 className="m-0 fw-bold glow" style={{ fontSize: 28, letterSpacing: 1 }}>
        Welcome to <span style={{ color: '#fff', fontWeight: 'bold' }}>FeelScope</span>
      </h2>
      <button
        aria-label="Toggle dark mode"
        onClick={toggleTheme}
        style={{
          background: 'none',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          fontSize: 28,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'color 0.3s',
        }}
      >
        {darkMode ? <FaMoon style={{ color: '#ffe066', filter: 'drop-shadow(0 0 6px #ffe06688)' }} /> : <FaSun style={{ color: '#ffd700', filter: 'drop-shadow(0 0 6px #ffd70088)' }} />}
        <span style={{ fontSize: 18, fontWeight: 500 }}>{darkMode ? 'Dark' : 'Light'} Mode</span>
      </button>
    </motion.div>
  );
}
