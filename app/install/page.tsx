'use client';
import { useEffect, useState } from 'react';
import { Download, Smartphone, Check, Share, Chrome, MoreVertical } from 'lucide-react';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installReady, setInstallReady] = useState(false);

  useEffect(() => {
    // Detecta plataforma
    const ua = navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(ua);
    const android = /android/.test(ua);
    const chrome = /chrome/.test(ua) && !/edg/.test(ua);
    
    setIsIOS(iOS);
    setIsAndroid(android);
    setIsChrome(chrome);

    console.log('Plataforma:', { iOS, android, chrome });

    // Detecta se já está instalado (modo standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isStandaloneiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isStandaloneiOS) {
      console.log('App já instalado em modo standalone');
      setIsInstalled(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    // Captura evento de instalação (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('beforeinstallprompt event captured');
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallReady(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detecta quando app for instalado
    window.addEventListener('appinstalled', (evt) => {
      console.log('App instalado com sucesso!');
      setIsInstalled(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('Prompt não disponível');
      
      // Mostra instruções alternativas
      if (isAndroid) {
        alert(
          '📱 Como instalar:\n\n' +
          '1. Abra o menu do Chrome (3 pontos ⋮)\n' +
          '2. Toque em "Instalar app" ou "Adicionar à tela inicial"\n' +
          '3. Confirme a instalação\n\n' +
          'O app será aberto como aplicativo na próxima vez!'
        );
      }
      return;
    }

    setInstalling(true);
    console.log('Mostrando prompt de instalação...');

    try {
      // Mostra o prompt nativo
      await deferredPrompt.prompt();
      
      // Aguarda a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Resposta do usuário: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
        setIsInstalled(true);
      } else {
        console.log('Usuário recusou a instalação');
        setInstalling(false);
      }

      // Limpa o prompt
      setDeferredPrompt(null);
      setInstallReady(false);
    } catch (error) {
      console.error('Erro ao instalar:', error);
      setInstalling(false);
      
      alert(
        'Não foi possível instalar automaticamente.\n\n' +
        'Por favor, use o menu do navegador:\n' +
        '1. Toque nos 3 pontos (⋮)\n' +
        '2. Selecione "Instalar app"\n' +
        '3. Confirme'
      );
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">App Instalado!</h1>
          <p className="text-gray-600 mb-4">Abrindo aplicativo...</p>
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-slide-up">
        {/* Logo */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Smartphone className="w-12 h-12 text-white" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Orlando Mercado
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Instale o app na tela inicial
        </p>

        {/* Benefícios */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Acesso Rápido</h3>
              <p className="text-sm text-gray-600">Abra direto da tela inicial</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Funciona como App</h3>
              <p className="text-sm text-gray-600">Tela cheia, sem navegador</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Funciona Offline</h3>
              <p className="text-sm text-gray-600">Consulte mesmo sem internet</p>
            </div>
          </div>
        </div>

        {/* ANDROID com Chrome - Botão Automático */}
        {isAndroid && isChrome && installReady && (
          <div className="space-y-3 mb-4">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              {installing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Instalar App Agora
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 py-2 px-4 rounded-lg">
              <Chrome className="w-4 h-4" />
              <span className="font-semibold">Instalação com 1 clique</span>
            </div>
          </div>
        )}

        {/* ANDROID - Instruções Manual */}
        {isAndroid && (!isChrome || !installReady) && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-4">
            <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <MoreVertical className="w-5 h-5" />
              Como instalar no Android:
            </h3>
            
            {!isChrome && (
              <div className="mb-3 p-3 bg-orange-100 rounded-lg">
                <p className="text-sm text-orange-900 font-semibold flex items-center gap-2">
                  <Chrome className="w-4 h-4" />
                  Abra esta página no Chrome para instalação automática
                </p>
              </div>
            )}
            
            <ol className="text-sm text-orange-800 space-y-2">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Toque no menu <strong>(3 pontos ⋮)</strong> do navegador</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Toque em <strong>"Instalar"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span><strong className="text-orange-900">IMPORTANTE:</strong> Na próxima vez, <strong>abra pelo ícone na tela inicial</strong> (não pelo navegador)</span>
              </li>
            </ol>
          </div>
        )}

        {/* iOS - Instruções */}
        {isIOS && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-4">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Share className="w-5 h-5" />
              Como instalar no iPhone:
            </h3>
            <ol className="text-sm text-blue-800 space-y-3">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Toque no botão <strong>Compartilhar</strong> (quadrado com seta ↑) no Safari</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Toque em <strong>"Adicionar"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span><strong className="text-blue-900">IMPORTANTE:</strong> Abra o app pelo ícone na tela inicial</span>
              </li>
            </ol>
            
            <div className="mt-3 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-900 font-semibold">
                💡 O botão Compartilhar fica na barra inferior do Safari
              </p>
            </div>
          </div>
        )}

        {/* Botão Continuar no Navegador */}
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
        >
          Continuar no Navegador
        </button>

        {/* Dica Importante */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-900 font-semibold mb-1">
            ⚠️ Importante:
          </p>
          <p className="text-sm text-yellow-800">
            Para funcionar como app, <strong>sempre abra pelo ícone na tela inicial</strong>, não pelo navegador!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-in;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}