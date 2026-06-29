import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#ECFDF5',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FEF2F2',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
