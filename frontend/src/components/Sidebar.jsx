import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export default function Sidebar() {
  const location = useLocation();
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Threats', path: '/threats', icon: '⚠️' },
    { name: 'Incidents', path: '/incidents', icon: '🚨' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Zero Trust', path: '/zero-trust', icon: '🔐' },
    { name: 'Rules', path: '/rules', icon: '⚙️' },
  ];

  return (
    <aside className={`${
      sidebarOpen ? 'w-64' : 'w-20'
    } bg-neutral-800 border-r border-neutral-700 transition-all duration-300 flex flex-col`}>
      {/* Logo/Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700">
        {sidebarOpen && <h1 className="text-lg font-bold text-primary-400">AI-NGFW</h1>}
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-neutral-700 rounded transition"
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location.pathname === item.path
                ? 'bg-primary text-white'
                : 'text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-700 p-4">
        {sidebarOpen && (
          <div className="text-xs text-neutral-400">
            <p>Status: Online</p>
            <p className="mt-1">v0.1.0</p>
          </div>
        )}
      </div>
    </aside>
  );
}
