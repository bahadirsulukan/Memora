import { Outlet } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { VisitsProvider } from '../contexts/VisitsContext';

export function RootLayout() {
  return (
    <AuthProvider>
      <VisitsProvider>
        <Outlet />
      </VisitsProvider>
    </AuthProvider>
  );
}