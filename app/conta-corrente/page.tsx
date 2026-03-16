'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Calendar, DollarSign } from 'lucide-react';

interface Movimentacao {
  id: string;
  tipo: 'compra' | 'pagamento';
  data: string;
  valor: number;
  descricao: string;
}

export default function ContaCorrente() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldoDevedor, setSaldoDevedor] = useState(0);
  const [filtro, setFiltro] = useState<'todos' | 'compra' | 'pagamento'>('todos');

  useEffect(() => {
    carregarContaCorrente();
  }, []);

  const carregarContaCorrente = async () => {
    setLoading(true);
    try {
      const clienteData = localStorage.getItem('cliente');
      if (!clienteData) {
        window.location.href = '/login';
        return;
      }

      const cliente = JSON.parse(clienteData);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orlando-admin.vercel.app';
      
      const res = await fetch(`${API_URL}/api/clientes/conta-corrente/${cliente.id}`);
      if (res.ok) {
        const data = await res.json();
        setMovimentacoes(data.movimentacoes || []);
        setSaldoDevedor(data.saldoDevedor || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar conta corrente:', error);
    }
    setLoading(false);
  };

  const formatarData = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarValor = (valor: number) => {
    return valor.toFixed(2).replace('.', ',');
  };

  const movimentacoesFiltradas = movimentacoes.filter(m => {
    if (filtro === 'todos') return true;
    return m.tipo === filtro;
  });

  const totalCompras = movimentacoes
    .filter(m => m.tipo === 'compra')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalPagamentos = movimentacoes
    .filter(m => m.tipo === 'pagamento')
    .reduce((sum, m) => sum + m.valor, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center active:scale-95 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Conta Corrente</h1>
              <p className="text-sm text-gray-600">Histórico completo</p>
            </div>
            <button
              onClick={carregarContaCorrente}
              disabled={loading}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center active:scale-95 transition-all"
            >
              <RefreshCw className={`w-5 h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            {[
              { valor: 'todos', label: 'Todos' },
              { valor: 'compra', label: 'Compras' },
              { valor: 'pagamento', label: 'Pagamentos' },
            ].map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor as any)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filtro === f.valor
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Card Saldo Devedor */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <h2 className="text-lg font-bold">Saldo Devedor Atual</h2>
          </div>
          <p className="text-5xl font-bold mb-4">R$ {formatarValor(saldoDevedor)}</p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Compras</p>
              <p className="text-xl font-bold">R$ {formatarValor(totalCompras)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">Total Pago</p>
              <p className="text-xl font-bold">R$ {formatarValor(totalPagamentos)}</p>
            </div>
          </div>
        </div>

        {/* Movimentações */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : movimentacoesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Nenhuma movimentação
            </h3>
            <p className="text-gray-600 text-sm">
              {filtro === 'compra' ? 'Nenhuma compra registrada' : 
               filtro === 'pagamento' ? 'Nenhum pagamento registrado' : 
               'Sua conta está vazia'}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Extrato ({movimentacoesFiltradas.length} {movimentacoesFiltradas.length === 1 ? 'movimentação' : 'movimentações'})
            </h2>
            
            <div className="space-y-3">
              {movimentacoesFiltradas.map((mov) => (
                <div 
                  key={mov.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mov.tipo === 'compra' 
                          ? 'bg-red-100' 
                          : 'bg-green-100'
                      }`}>
                        {mov.tipo === 'compra' ? (
                          <TrendingUp className="w-5 h-5 text-red-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-gray-900">
                          {mov.tipo === 'compra' ? 'Compra' : 'Pagamento'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatarData(mov.data)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        mov.tipo === 'compra' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {mov.tipo === 'compra' ? '+' : '-'}R$ {formatarValor(mov.valor)}
                      </p>
                    </div>
                  </div>

                  {mov.descricao && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{mov.descricao}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800 text-center">
            💡 <strong>Dica:</strong> Mantenha sua conta em dia para continuar comprando no fiado!
          </p>
        </div>
      </div>
    </div>
  );
}
