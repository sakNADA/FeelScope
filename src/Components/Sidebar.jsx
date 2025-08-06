import { NavLink } from 'react-router-dom';
import { FaChartPie, FaHistory, FaFileExport, FaReddit } from 'react-icons/fa';

export default function Sidebar({ darkMode = false }) {
  return (
    <div
      className="sidebar d-flex flex-column align-items-center py-4 px-3"
      style={{
        width: '250px',
        minHeight: '100vh',
        background: darkMode
          ? 'linear-gradient(180deg, #232526 0%, #414345 100%)'
          : 'linear-gradient(180deg, #6C5CE7 0%, #a29bfe 100%)',
        color: darkMode ? '#f8f9fa' : '#fff',
        boxShadow: '2px 0 18px rgba(0,0,0,0.18)',
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        borderRight: darkMode ? '1.5px solid #333' : '1.5px solid #a29bfe',
        transition: 'all 0.3s',
      }}
    >
      {/* Logo + Title */}
      <div className="text-center mb-4" style={{ width: '100%' }}>
        <img
          src="/LOGOfeelScope.svg"
          alt="FeelScope Logo"
          style={{
            width: '160px',
            height: '160px',
            objectFit: 'contain',
            marginBottom: '10px',
            filter: darkMode ? 'drop-shadow(0 0 20px #a29bfe88)' : 'drop-shadow(0 0 20px #a29bfe88)',
            transition: 'transform 0.3s, filter 0.3s',
            borderRadius: '50%',
            background: 'transparent',
            boxShadow: darkMode ? '0 0 32px #a29bfe88' : '0 0 32px #a29bfe88',
            padding: 0,
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>
      {/* Navigation */}
      <ul className="nav flex-column w-100">
        <SidebarItem to="/" icon={<FaChartPie />} label="Analyze" darkMode={darkMode} />
        <SidebarItem to="/history" icon={<FaHistory />} label="History" darkMode={darkMode} />
        <SidebarItem to="/export" icon={<FaFileExport />} label="Export" darkMode={darkMode} />
        <SidebarItem to="/reddit" icon={<FaReddit />} label="Reddit" darkMode={darkMode} />
      </ul>
    </div>
  );
}

function SidebarItem({ to, icon, label, darkMode }) {
  return (
    <li className="nav-item mb-2">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
            isActive ? 'active-sidebar-link' : ''
          } ${darkMode ? 'sidebar-dark-link' : 'sidebar-light-link'}`
        }
        style={{ fontWeight: 500, fontSize: '16px', color: darkMode ? '#f8f9fa' : '#fff', transition: 'color 0.3s' }}
      >
        {icon}
        {label}
      </NavLink>
    </li>
  );
}
