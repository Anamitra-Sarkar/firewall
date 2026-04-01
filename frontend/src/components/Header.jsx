import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-white">AI-Driven Next-Generation Firewall</h2>
        <p className="text-sm text-neutral-400 mt-1">Real-time threat detection & response</p>
      </div>
      
      <div className="flex items-center gap-6">
        {/* User profile */}
        <div className="text-right">
          <p className="text-sm font-medium text-white">Admin User</p>
          <p className="text-xs text-neutral-400">SOC Operator</p>
        </div>
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
