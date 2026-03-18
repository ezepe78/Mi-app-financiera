'use client';

import React from 'react';
import { signInWithGoogle } from '@/lib/firebase';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

import Image from 'next/image';

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center"
      >
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-blue-600/20">
          F
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finanzas Personales</h1>
        <p className="text-gray-500 mb-8">Gestioná tus gastos de forma simple y segura.</p>
        
        <button 
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
        >
          <Image 
            src="https://www.gstatic.com/firebase/builtins/external/google.svg" 
            alt="Google" 
            width={24} 
            height={24} 
            referrerPolicy="no-referrer"
          />
          Continuar con Google
        </button>
        
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Offline-First & Cloud Sync</p>
        </div>
      </motion.div>
    </div>
  );
}
