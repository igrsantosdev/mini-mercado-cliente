'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, CreditCard, FileText, LogOut, 
  Package, DollarSign, AlertCircle, RefreshCw 
} from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  preco: string;
  disponivel: boolean;
}

interface Fiado {
  id: string;
  data: string;
  valor: number;
  status: 'pendente' | 'pago';
}

export default function ClienteHome() {
  const [cliente, setCliente] = useState<any>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fiados, setFiados] = useState<Fiado[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPendente, setTotalPendente] = useState(0);

  useEffect(() => {
    // Pega dados do cliente do localStorage
    const clienteData = localStorage.getItem('cliente');
    if (clienteData) {
      setCliente(JSON.parse(clienteData));
      carregarDados();
    } else {
      window.location.href = '/login';
    }
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Busca produtos
      const resProdutos = await fetch('https://seu-admin.vercel.app/api/clientes/produtos');
      if (resProdutos.ok) {
        const data = await resProdutos.json();
        setProdutos(data);
      }

      // Busca fiados do cliente
      const clienteId = JSON.parse(localStorage.getItem('cliente') || '{}').id;
      const resFiados = await fetch(`https://seu-admin.vercel.app/api/clientes/fiados/${clienteId}`);
      if (resFiados.ok) {
        const data = await resFiados.json();
        setFiados(data.fiados || []);
        setTotalPendente(data.totalPendente || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('cliente');
    window.location.href = '/login';
  };

  if (!cliente) return null;

  const produtosDisponiveis = produtos.filter(p => p.disponivel);
  const fiadosPendentes = fiados.filter(f => f.status === 'pendente');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Orlando Mercado</h1>
              <p className="text-sm text-green-100">Olá, {cliente.nome}!</p>
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center active:scale-95 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Card Resumo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Minha Conta</h2>
            <button
              onClick={carregarDados}
              disabled={loading}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <p className="text-xs font-semibold text-orange-900">Fiados Pendentes</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {fiadosPendentes.length}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                <p className="text-xs font-semibold text-red-900">Total Devedor</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalPendente.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Principal */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/catalogo">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md active:scale-95 transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Catálogo</h3>
              <p className="text-xs text-gray-600">{produtosDisponiveis.length} produtos</p>
            </div>
          </Link>

          <Link href="/fiados">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md active:scale-95 transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Meus Fiados</h3>
              <p className="text-xs text-gray-600">{fiadosPendentes.length} pendentes</p>
            </div>
          </Link>

          <Link href="/conta-corrente">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md active:scale-95 transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Conta Corrente</h3>
              <p className="text-xs text-gray-600">Ver extrato</p>
            </div>
          </Link>

          <Link href="/perfil">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md active:scale-95 transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Meu Perfil</h3>
              <p className="text-xs text-gray-600">Dados pessoais</p>
            </div>
          </Link>
        </div>

        {/* Produtos em Destaque */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Produtos Disponíveis</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : produtosDisponiveis.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Nenhum produto disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              {produtosDisponiveis.slice(0, 3).map((produto) => (
                <div key={produto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{produto.nome}</h4>
                    <p className="text-sm text-green-600 font-bold">R$ {produto.preco}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    Disponível
                  </span>
                </div>
              ))}
              
              {produtosDisponiveis.length > 3 && (
                <Link href="/catalogo">
                  <button className="w-full h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-semibold text-sm transition-all">
                    Ver todos ({produtosDisponiveis.length} produtos)
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Info PWA */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-4">
          <p className="text-sm text-gray-700 text-center">
            💡 <strong>Dica:</strong> Adicione este app à sua tela inicial para acesso rápido!
          </p>
        </div>
      </div>
    </div>
  );
}
