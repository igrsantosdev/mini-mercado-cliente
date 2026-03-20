'use client';
import { useEffect, useState } from 'react';
import { Download, Smartphone, Check, Share, Chrome, MoreVertical, AlertCircle } from 'lucide-react';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  
  // DEBUG
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(ua);
    const android = /android/.test(ua);
    const chrome = /chrome/.test(ua) && !/edg/.test(ua);
    
    setIsIOS(iOS);
    setIsAndroid(android);
    setIsChrome(chrome);

    // DEBUG INFO
    const debug = {
      userAgent: navigator.userAgent,
      isIOS: iOS,
      isAndroid: android,
      isChrome: chrome,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isStandaloneiOS: (window.navigator as any).standalone === true,
      hasServiceWorker: 'serviceWorker' in navigator,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      promptCaptured: false,
      timestamp: new Date().toISOString(),
    };
    
    setDebugInfo(debug);
    console.log('=== PWA DEBUG INFO ===');
    console.log(debug);

    // Detecta se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isStandaloneiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isStandaloneiOS) {
      console.log('App já instalado');
      setIsInstalled(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    // Contador de tempo esperando pelo evento
    let eventTimeout: any;
    let waitTime = 0;
    const waitInterval = setInterval(() => {
      waitTime += 100;
      if (waitTime >= 3000) {
        clearInterval(waitInterval);
        console.log('⚠️ beforeinstallprompt NÃO disparou após 3 segundos');
        setDebugInfo((prev: any) => ({
          ...prev,
          promptCaptured: false,
          waitedMs: waitTime,
          message: 'Evento não disparou - requisitos não atendidos'
        }));
      }
    }, 100);

    // Captura evento de instalação
    const handleBeforeInstallPrompt = (e: any) => {
      clearInterval(waitInterval);
      console.log('✅ beforeinstallprompt CAPTURADO!');
      console.log('Event:', e);
      
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallReady(true);
      
      setDebugInfo((prev: any) => ({
        ...prev,
        promptCaptured: true,
        capturedAt: new Date().toISOString(),
        waitedMs: waitTime,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detecta quando app for instalado
    window.addEventListener('appinstalled', (evt) => {
      console.log('✅ App instalado!');
      setIsInstalled(true);
    });

    // Timeout de segurança
    eventTimeout = setTimeout(() => {
      if (!deferredPrompt) {
        console.log('⏰ Timeout: 5 segundos sem beforeinstallprompt');
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(eventTimeout);
      clearInterval(waitInterval);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('❌ Prompt não disponível');
      alert(
        '❌ Instalação automática não disponível\n\n' +
        'Possíveis causas:\n' +
        '• App já instalado\n' +
        '• Manifest inválido\n' +
        '• Service Worker não registrado\n' +
        '• Não está em HTTPS\n\n' +
        'Tente pelo menu do Chrome:\n' +
        '1. Toque nos 3 pontos (⋮)\n' +
        '2. "Instalar app"'
      );
      return;
    }

    setInstalling(true);
    console.log('📲 Mostrando prompt...');

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('Resultado:', outcome);

      if (outcome === 'accepted') {
        console.log('✅ Aceito');
        setIsInstalled(true);
      } else {
        console.log('❌ Recusado');
        setInstalling(false);
      }

      setDeferredPrompt(null);
      setInstallReady(false);
    } catch (error) {
      console.error('❌ Erro:', error);
      setInstalling(false);
      alert('Erro ao instalar: ' + error);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">App Instalado!</h1>
          <p className="text-gray-600 mb-4">Redirecionando...</p>
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        {/* Botão Debug */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="mb-4 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg"
        >
          {showDebug ? 'Ocultar' : 'Mostrar'} Debug Info
        </button>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-6 p-4 bg-gray-900 text-white rounded-xl text-xs font-mono overflow-auto max-h-60">
            <div className="space-y-1">
              <div><strong>User Agent:</strong> {debugInfo.userAgent}</div>
              <div><strong>iOS:</strong> {debugInfo.isIOS ? '✅ SIM' : '❌ NÃO'}</div>
              <div><strong>Android:</strong> {debugInfo.isAndroid ? '✅ SIM' : '❌ NÃO'}</div>
              <div><strong>Chrome:</strong> {debugInfo.isChrome ? '✅ SIM' : '❌ NÃO'}</div>
              <div><strong>Standalone:</strong> {debugInfo.isStandalone ? '✅ SIM' : '❌ NÃO'}</div>
              <div><strong>ServiceWorker:</strong> {debugInfo.hasServiceWorker ? '✅ SIM' : '❌ NÃO'}</div>
              <div><strong>Protocol:</strong> {debugInfo.protocol}</div>
              <div><strong>Hostname:</strong> {debugInfo.hostname}</div>
              <div><strong>Prompt Capturado:</strong> {debugInfo.promptCaptured ? '✅ SIM' : '❌ NÃO'}</div>
              {debugInfo.waitedMs && <div><strong>Tempo esperado:</strong> {debugInfo.waitedMs}ms</div>}
              {debugInfo.message && <div><strong>Mensagem:</strong> {debugInfo.message}</div>}
            </div>
          </div>
        )}

        {/* Status Visual */}
        <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded-lg ${isAndroid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            Android: {isAndroid ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded-lg ${isChrome ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            Chrome: {isChrome ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded-lg ${installReady ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            Evento: {installReady ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded-lg ${debugInfo.hasServiceWorker ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            SW: {debugInfo.hasServiceWorker ? '✅' : '❌'}
          </div>
        </div>

        {/* Logo */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Smartphone className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Orlando Mercado
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Instale o app na tela inicial
        </p>

        {/* ANDROID + CHROME + EVENTO CAPTURADO */}
        {isAndroid && isChrome && installReady && (
          <div className="space-y-3 mb-4">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
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
              <span className="font-semibold">✅ Pronto para instalar!</span>
            </div>
          </div>
        )}

        {/* ANDROID + CHROME + SEM EVENTO */}
        {isAndroid && isChrome && !installReady && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-orange-900 mb-1">
                  Botão de instalação não disponível
                </h3>
                <p className="text-sm text-orange-800 mb-2">
                  O evento de instalação não foi capturado. Possíveis causas:
                </p>
                <ul className="text-xs text-orange-700 space-y-1 ml-4 list-disc">
                  <li>App já está instalado</li>
                  <li>Manifest.json com erro</li>
                  <li>Service Worker não registrado</li>
                  <li>Requisitos PWA não atendidos</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-sm text-orange-900 font-semibold mb-2">
                Instale manualmente pelo Chrome:
              </p>
              <ol className="text-sm text-orange-800 space-y-1">
                <li>1. Toque nos 3 pontos (⋮) do Chrome</li>
                <li>2. Selecione "Instalar app"</li>
                <li>3. Confirme "Instalar"</li>
              </ol>
            </div>
          </div>
        )}

        {/* ANDROID + NÃO É CHROME */}
        {isAndroid && !isChrome && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-4">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Chrome className="w-5 h-5" />
              Use o Chrome para melhor experiência
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Para instalação automática com 1 clique, abra esta página no <strong>Google Chrome</strong>.
            </p>
            <p className="text-sm text-blue-700">
              Ou instale manualmente pelo menu do navegador (3 pontos → Instalar app)
            </p>
          </div>
        )}

        {/* iOS */}
        {isIOS && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-4">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Share className="w-5 h-5" />
              Como instalar no iPhone:
            </h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Toque em Compartilhar (↑) no Safari</li>
              <li>2. Role e toque "Adicionar à Tela de Início"</li>
              <li>3. Toque "Adicionar"</li>
              <li>4. Abra pelo ícone na tela inicial</li>
            </ol>
          </div>
        )}

        <button
          onClick={() => window.location.href = '/login'}
          className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
        >
          Continuar no Navegador
        </button>

        {/* Instruções de Troubleshooting */}
        <details className="mt-6">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
            ❓ Não está funcionando?
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs text-gray-700 space-y-2">
            <p><strong>Verifique:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Está usando Chrome no Android?</li>
              <li>Está em HTTPS (não HTTP)?</li>
              <li>App não está já instalado?</li>
              <li>Aguardou alguns segundos?</li>
            </ul>
            <p className="mt-2"><strong>Veja o Debug Info acima para mais detalhes</strong></p>
          </div>
        </details>
      </div>
    </div>
  );
}