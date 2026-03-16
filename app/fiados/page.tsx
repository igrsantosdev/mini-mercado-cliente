'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, ChevronRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface Fiado {
  id: string;
  data: string;
  valor: number;
  status: 'pendente' | 'pago';
  dataPagamento?: string;
  produtos?: Array<{
    nome: string;
    quantidade: number;
    precoUnitario: number;
  }>;
}

export default function Fiados() {
  const [fiados, setFiados] = useState<Fiado[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPendente, setTotalPendente] = useState(0);
  const [filtro, setFiltro] = useState<'todos' | 'pendente' | 'pago'>('todos');

  useEffect(() => {
    carregarFiados();
  }, []);

  const carregarFiados = async () => {
    setLoading(true);
    try {
      const clienteData = localStorage.getItem('cliente');
      if (!clienteData) {
        window.location.href = '/login';
        return;
      }

      const cliente = JSON.parse(clienteData);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orlando-admin.vercel.app';
      
      const res = await fetch(`${API_URL}/api/clientes/fiados/${cliente.id}`);
      if (res.ok) {
        const data = await res.json();
        setFiados(data.fiados || []);
        setTotalPendente(data.totalPendente || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar fiados:', error);
    }
    setLoading(false);
  };

  const formatarData = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const fiadosFiltrados = fiados.filter(f => {
    if (filtro === 'todos') return true;
    return f.status === filtro;
  });

  const pendentes = fiados.filter(f => f.status === 'pendente');
  const pagos = fiados.filter(f => f.status === 'pago');

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
              <h1 className="text-xl font-bold text-gray-900">Meus Fiados</h1>
              <p className="text-sm text-gray-600">{pendentes.length} pendentes • {pagos.length} pagos</p>
            </div>
            <button
              onClick={carregarFiados}
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
              { valor: 'pendente', label: 'Pendentes' },
              { valor: 'pago', label: 'Pagos' },
            ].map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor as any)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filtro === f.valor
                    ? 'bg-orange-500 text-white'
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
        {/* Card Total Pendente */}
        {totalPendente > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-lg font-bold">Total Pendente</h2>
            </div>
            <p className="text-4xl font-bold mb-1">R$ {totalPendente.toFixed(2).replace('.', ',')}</p>
            <p className="text-sm opacity-90">{pendentes.length} {pendentes.length === 1 ? 'fiado' : 'fiados'} em aberto</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fiadosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {filtro === 'pendente' ? 'Nenhum fiado pendente' : 
               filtro === 'pago' ? 'Nenhum fiado pago' : 
               'Nenhum fiado registrado'}
            </h3>
            <p className="text-gray-600 text-sm">
              {filtro === 'pendente' ? 'Você está em dia! 🎉' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fiadosFiltrados.map((fiado) => (
              <Link key={fiado.id} href={`/fiados/${fiado.id}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md active:scale-98 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-gray-600">{formatarData(fiado.data)}</p>
                        {fiado.status === 'pendente' ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                            Pendente
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Pago
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {fiado.valor.toFixed(2).replace('.', ',')}
                      </p>
                      {fiado.dataPagamento && (
                        <p className="text-xs text-gray-500 mt-1">
                          Pago em {formatarData(fiado.dataPagamento)}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>

                  {/* Preview dos produtos */}
                  {fiado.produtos && fiado.produtos.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-2">
                        {fiado.produtos.length} {fiado.produtos.length === 1 ? 'produto' : 'produtos'}
                      </p>
                      <div className="space-y-1">
                        {fiado.produtos.slice(0, 2).map((prod, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-600">
                              {prod.quantidade}x {prod.nome}
                            </span>
                            <span className="text-gray-900 font-semibold">
                              R$ {(prod.quantidade * prod.precoUnitario).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                        {fiado.produtos.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{fiado.produtos.length - 2} {fiado.produtos.length - 2 === 1 ? 'produto' : 'produtos'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
