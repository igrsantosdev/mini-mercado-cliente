// app/layout.tsx - Com limpeza de cache após login
import type { Metadata, Viewport } from 'next';
import UpdatePrompt from './components/UpdatePrompt';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orlando Mercado - Clientes',
  description: 'App para clientes do Orlando Mercado - Catálogo de produtos, fiados e conta corrente',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Orlando',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Orlando Mercado',
    title: 'Orlando Mercado - Área do Cliente',
    description: 'Acesse seu catálogo e fiados',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10B981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Orlando" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
        
        {/* Modal de Atualização */}
        <UpdatePrompt />
        
        {/* Service Worker Registration com controle de cache */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('SW registered:', registration.scope);
                      
                      // Verifica se há atualização
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Novo SW instalado, avisar para atualizar
                            if (confirm('Nova versão disponível! Atualizar agora?')) {
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              window.location.reload();
                            }
                          }
                        });
                      });
                    })
                    .catch(error => {
                      console.log('SW registration failed:', error);
                    });
                    
                  // Listener para quando SW é ativado
                  let refreshing = false;
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                      refreshing = true;
                      window.location.reload();
                    }
                  });
                });
                
                // Função global para limpar cache (útil para debug)
                window.clearAppCache = () => {
                  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
                    console.log('Cache cleared! Reloading...');
                    setTimeout(() => window.location.reload(), 1000);
                  }
                };
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
