import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock authentication
    if (username && password) {
      login('test-token-12345', { username, role: 'admin' });
      navigate('/');
    } else {
      setError('Please enter username and password');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-neutral-800 rounded-lg p-8 shadow-xl border border-neutral-700">
          <h1 className="text-3xl font-bold text-white mb-2">AI-NGFW</h1>
          <p className="text-neutral-400 mb-8">Next-Generation Firewall</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger text-danger rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            Demo credentials: any username/password combination
          </p>
        </div>
      </div>
    </div>
  );
}
