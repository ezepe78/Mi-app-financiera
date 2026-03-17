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
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    let message = "Ocurrió un error inesperado.";
    try {
      if (error?.message) {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.operationType) {
          message = `Error de base de datos (${parsed.operationType}): ${parsed.error}`;
        }
      }
    } catch (e) {
      message = error?.message || message;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">¡Ups! Algo salió mal</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
