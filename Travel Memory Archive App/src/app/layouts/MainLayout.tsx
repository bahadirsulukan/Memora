import { Outlet } from 'react-router';
import { BottomNav } from '../components/BottomNav';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}