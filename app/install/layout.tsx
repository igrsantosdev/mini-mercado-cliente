'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // Verifica atualizações a cada 30 segundos
        setInterval(() => {
          registration.update();
        }, 30000);

        // Quando encontrar atualização
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível!
              setShowUpdate(true);
            }
          });
        });
      });

      // Listener para recarregar quando novo SW estiver ativo
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    setUpdating(true);
    setProgress(0);

    // Simula progresso da atualização
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Envia mensagem para SW ativar
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
          }
          
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
        {/* Ícone */}
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          {updating ? (
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Download className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {updating ? 'Atualizando...' : 'Nova Versão Disponível!'}
        </h2>

        {/* Descrição */}
        <p className="text-gray-600 text-center mb-6">
          {updating
            ? 'Por favor, aguarde enquanto instalamos a atualização.'
            : 'Uma nova versão do Orlando Mercado está disponível com melhorias e correções.'}
        </p>

        {/* Barra de Progresso */}
        {updating && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Instalando atualização</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Botões */}
        {!updating && (
          <div className="space-y-3">
            <button
              onClick={handleUpdate}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg"
            >
              Atualizar Agora
            </button>
            <button
              onClick={() => setShowUpdate(false)}
              className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
            >
              Mais Tarde
            </button>
          </div>
        )}

        {/* Versão */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Versão 1.0.2 • {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}
