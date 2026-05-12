import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';

export default function App() {
  // Suppress THREE.js Clock deprecation warning
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}