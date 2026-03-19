'use client';
import { useEffect, useState } from 'react';
import { Download, Smartphone, Check, QrCode } from 'lucide-react';
import Image from 'next/image';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Detecta iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detecta se já está instalado
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(installed);

    // Se já instalado, redireciona
    if (installed) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }

    // Captura evento de instalação
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);

    // Mostra prompt de instalação
    deferredPrompt.prompt();

    // Aguarda escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('App instalado!');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }

    setDeferredPrompt(null);
    setInstalling(false);
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
        {/* Logo/Ícone */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Smartphone className="w-12 h-12 text-white" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Orlando Mercado
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Instale o app na tela inicial do seu celular
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
              <h3 className="font-semibold text-gray-900">Funciona Offline</h3>
              <p className="text-sm text-gray-600">Consulte seus fiados sem internet</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Atualizações Automáticas</h3>
              <p className="text-sm text-gray-600">Sempre com a versão mais recente</p>
            </div>
          </div>
        </div>

        {/* Botão de Instalação - Android */}
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            disabled={installing}
            className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 mb-4"
          >
            {installing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Instalando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Instalar App
              </>
            )}
          </button>
        )}

        {/* Instruções para iOS */}
        {isIOS && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Como instalar no iPhone:
            </h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Toque no botão <strong>Compartilhar</strong> (quadrado com seta ↑)</li>
              <li>2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
              <li>3. Toque em <strong>"Adicionar"</strong></li>
            </ol>
          </div>
        )}

        {/* Instruções para Android sem prompt */}
        {!isIOS && !deferredPrompt && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Como instalar:
            </h3>
            <ol className="text-sm text-orange-800 space-y-2">
              <li>1. Toque no menu (3 pontos) do navegador</li>
              <li>2. Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
              <li>3. Confirme a instalação</li>
            </ol>
          </div>
        )}

        {/* Botão Alternativo */}
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
        >
          Continuar no Navegador
        </button>
      </div>
    </div>
  );
}
