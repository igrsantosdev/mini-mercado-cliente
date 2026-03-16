'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Search, RefreshCw } from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  preco: string;
  estoque: string;
  disponivel: boolean;
}

export default function Catalogo() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orlando-admin.vercel.app';
      const res = await fetch(`${API_URL}/api/clientes/produtos`);
      if (res.ok) {
        const data = await res.json();
        setProdutos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
    setLoading(false);
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const disponiveis = produtosFiltrados.filter(p => p.disponivel);
  const indisponiveis = produtosFiltrados.filter(p => !p.disponivel);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center active:scale-95 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Catálogo de Produtos</h1>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full h-12 pl-12 pr-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Resumo */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600">
              {disponiveis.length} disponíveis • {indisponiveis.length} indisponíveis
            </p>
          </div>
          <button
            onClick={carregarProdutos}
            disabled={loading}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Produtos Disponíveis */}
            {disponiveis.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Disponíveis</h2>
                <div className="space-y-3">
                  {disponiveis.map((produto) => (
                    <div key={produto.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{produto.nome}</h3>
                          <p className="text-2xl font-bold text-green-600">R$ {produto.preco}</p>
                          {produto.estoque && (
                            <p className="text-sm text-gray-600 mt-1">
                              Estoque: {produto.estoque} unidades
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex-shrink-0">
                          Disponível
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Produtos Indisponíveis */}
            {indisponiveis.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Indisponíveis no momento</h2>
                <div className="space-y-3">
                  {indisponiveis.map((produto) => (
                    <div key={produto.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 opacity-60">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{produto.nome}</h3>
                          <p className="text-2xl font-bold text-gray-500">R$ {produto.preco}</p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex-shrink-0">
                          Indisponível
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nenhum resultado */}
            {produtosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {busca ? 'Tente buscar por outro nome' : 'Em breve teremos produtos disponíveis'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
