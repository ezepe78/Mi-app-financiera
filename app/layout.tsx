import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { FirebaseProvider, ErrorBoundary } from '@/components/FirebaseProvider';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Finanzas Personales',
  description: 'Gestor de finanzas personales con Firebase',
  manifest: '/manifest.json',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased">
        <FirebaseProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </FirebaseProvider>
        <Toaster position="top-center" richColors />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.APP_VERSION = '1.0.5';
              console.log('App Version:', window.APP_VERSION);

              // Kill any existing service workers
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister().then(function() {
                      console.log('ServiceWorker unregistered successfully');
                    });
                  }
                });
              }

              // Clear cache if version changed
              const lastVersion = localStorage.getItem('app_version');
              if (lastVersion !== window.APP_VERSION) {
                console.log('Version change detected, clearing caches...');
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let name of names) caches.delete(name);
                  });
                }
                localStorage.setItem('app_version', window.APP_VERSION);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
