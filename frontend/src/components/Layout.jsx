import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NeuralFlowCanvas from './NeuralFlowCanvas';

export default function Layout() {
  return (
    <div className="flex h-screen" style={{ background: '#f8fafc', position: 'relative' }}>
      {/* Neural flow background */}
      <NeuralFlowCanvas />

      {/* Sidebar */}
      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        <Header />
        <main
          className="flex-1 overflow-auto p-6"
          style={{ background: 'transparent' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
