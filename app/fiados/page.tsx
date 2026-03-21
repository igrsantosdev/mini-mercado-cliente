'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CreditCard, ChevronRight, AlertCircle, CheckCircle2, 
  RefreshCw, Calendar, Package, DollarSign, History, Receipt
} from 'lucide-react';

interface Fiado {
  id: string;
  data: string;
  valorTotal: number;
  valorPago: number;
  saldoAtual: number;
  status: 'pendente' | 'parcial' | 'pago';
  produtos: Array<{
    nome: string;
    quantidade: number;
    precoUnitario: number;
  }>;
  historicoPagamentos: Array<{
    data: string;
    tipo: string;
    valor: number;
    metodoPagamento?: string;
    obs?: string;
  }>;
}

export default function MeusFiados() {
  const [fiados, setFiados] = useState<Fiado[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPendente, setTotalPendente] = useState(0);
  const [filtro, setFiltro] = useState<'todos' | 'pendente' | 'parcial' | 'pago'>('todos');
  const [expandido, setExpandido] = useState<string | null>(null);

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mini-mercado-app.vercel.app';
      
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
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatarDataHora = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fiadosFiltrados = fiados.filter(f => {
    if (filtro === 'todos') return true;
    return f.status === filtro;
  });

  const pendentes = fiados.filter(f => f.status === 'pendente' || f.status === 'parcial');
  const pagos = fiados.filter(f => f.status === 'pago');

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-700';
      case 'parcial': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const getLabelStatus = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'parcial': return 'Parcial';
      default: return 'Pendente';
    }
  };

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
          <div className="flex gap-2 overflow-x-auto">
            {[
              { valor: 'todos', label: 'Todos' },
              { valor: 'pendente', label: 'Pendentes' },
              { valor: 'parcial', label: 'Parciais' },
              { valor: 'pago', label: 'Pagos' },
            ].map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor as any)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
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
              <h2 className="text-lg font-bold">Saldo Devedor</h2>
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
              <div key={fiado.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Cabeçalho do Fiado */}
                <button
                  onClick={() => setExpandido(expandido === fiado.id ? null : fiado.id)}
                  className="w-full p-4 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <p className="text-sm font-semibold text-gray-700">{formatarData(fiado.data)}</p>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getCorStatus(fiado.status)}`}>
                          {getLabelStatus(fiado.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-sm font-bold text-gray-900">
                            R$ {fiado.valorTotal.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pago</p>
                          <p className="text-sm font-bold text-green-600">
                            R$ {fiado.valorPago.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pendente</p>
                          <p className="text-sm font-bold text-red-600">
                            R$ {fiado.saldoAtual.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      expandido === fiado.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </button>

                {/* Detalhes Expandidos */}
                {expandido === fiado.id && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                    {/* Produtos */}
                    {fiado.produtos && fiado.produtos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 mt-4">
                          <Package className="w-4 h-4 text-gray-600" />
                          <h4 className="font-bold text-gray-900 text-sm">Produtos ({fiado.produtos.length})</h4>
                        </div>
                        <div className="space-y-2">
                          {fiado.produtos.map((prod, idx) => (
                            <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-sm">{prod.nome}</p>
                                <p className="text-xs text-gray-600">
                                  {prod.quantidade}x R$ {prod.precoUnitario.toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                              <p className="font-bold text-gray-900">
                                R$ {(prod.quantidade * prod.precoUnitario).toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Histórico de Pagamentos */}
                    {fiado.historicoPagamentos && fiado.historicoPagamentos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <History className="w-4 h-4 text-gray-600" />
                          <h4 className="font-bold text-gray-900 text-sm">Histórico</h4>
                        </div>
                        <div className="space-y-2">
                          {fiado.historicoPagamentos.map((pag, idx) => (
                            <div key={idx} className={`flex items-start justify-between p-3 rounded-lg ${
                              pag.tipo === 'pagamento' ? 'bg-green-50' : 'bg-gray-50'
                            }`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {pag.tipo === 'pagamento' ? (
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Receipt className="w-4 h-4 text-gray-600" />
                                  )}
                                  <p className="text-xs font-semibold text-gray-700">
                                    {formatarDataHora(pag.data)}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {pag.obs || `${pag.tipo === 'pagamento' ? 'Pagamento' : 'Abertura'} - ${pag.metodoPagamento || ''}`}
                                </p>
                              </div>
                              <p className={`font-bold text-sm ${
                                pag.tipo === 'pagamento' ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {pag.tipo === 'pagamento' ? '-' : ''}R$ {pag.valor.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumo Final */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">Saldo Atual:</span>
                        <span className={`text-xl font-black ${
                          fiado.saldoAtual <= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {fiado.saldoAtual.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
