import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppStore } from '../store/appStore';

export default function Layout() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);

  return (
    <div className="flex h-screen bg-neutral-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-neutral-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
