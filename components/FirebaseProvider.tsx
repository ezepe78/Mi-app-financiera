'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testFirestoreConnection } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("FirebaseProvider: Setting up onAuthStateChanged");
    testFirestoreConnection();
    
    // Fallback timeout in case onAuthStateChanged hangs
    const timeoutId = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn("FirebaseProvider: Auth check timed out after 8s, forcing loading to false");
          return false;
        }
        return prev;
      });
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("FirebaseProvider: onAuthStateChanged fired", {
        uid: user ? user.uid : "no user",
        email: user ? user.email : "no email",
        emailVerified: user ? user.emailVerified : false
      });
      clearTimeout(timeoutId);
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error("FirebaseProvider: onAuthStateChanged error", error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      console.log("FirebaseProvider: Cleaning up onAuthStateChanged");
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("ErrorBoundary caught error:", event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    let message = error?.message || "Ocurrió un error inesperado.";
    
    // If it's a Firestore error with details, we might want to show more info in dev
    const details = (error as any)?.details;
    if (details) {
      console.error("Firestore error details:", details);
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2 text-center">¡Ups! Algo salió mal</h2>
          <p className="text-gray-600 mb-8 text-center">{message}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              Recargar aplicación
            </button>
            <button 
              onClick={() => setHasError(false)}
              className="w-full py-4 bg-white text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all border border-gray-100"
            >
              Intentar continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
