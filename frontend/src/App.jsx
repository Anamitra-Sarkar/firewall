import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Threats from './pages/Threats';
import Incidents from './pages/Incidents';
import Analytics from './pages/Analytics';
import ZeroTrust from './pages/ZeroTrust';
import Rules from './pages/Rules';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import './index.css';

function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="threats" element={<Threats />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="zero-trust" element={<ZeroTrust />} />
          <Route path="rules" element={<Rules />} />
        </Route>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
