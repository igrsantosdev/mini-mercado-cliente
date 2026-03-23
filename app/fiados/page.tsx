'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CreditCard, ChevronRight, AlertCircle, 
  RefreshCw, Calendar, Package, DollarSign, History, Receipt
} from 'lucide-react';

interface Fiado {
  id: string;
  data: string;
  valorTotal: any;
  valorPago: any;
  saldoAtual: any;
  status: 'pendente' | 'parcial' | 'pago';
  produtos?: Array<{
    nome: string;
    quantidade: any;
    precoUnitario: any;
  }>;
  historicoPagamentos?: Array<{
    data: string;
    tipo: string;
    valor: any;
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

  // 💰 função blindada
  const money = (v: any) => (Number(v) || 0).toFixed(2).replace('.', ',');

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

        const fiadosNormalizados = (data.fiados || []).map((f: any) => {
          const valorTotal = Number(f.valorTotal) || 0;
          const valorPago = Number(f.valorPago) || 0;
          const saldoAtual = Number(f.saldoAtual) || (valorTotal - valorPago);

          let status: 'pendente' | 'parcial' | 'pago' = 'pago';

          if (valorPago === 0) status = 'pendente';
          else if (saldoAtual > 0) status = 'parcial';

          return {
            ...f,
            valorTotal,
            valorPago,
            saldoAtual,
            status,
            produtos: Array.isArray(f.produtos) ? f.produtos : [],
            historicoPagamentos: Array.isArray(f.historicoPagamentos) ? f.historicoPagamentos : [],
          };
        });

        setFiados(fiadosNormalizados);
        setTotalPendente(Number(data.totalPendente) || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar fiados:', error);
    }
    setLoading(false);
  };

  const formatarData = (dataISO: string) => {
    if (!dataISO) return '--';
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataISO: string) => {
    if (!dataISO) return '--';
    return new Date(dataISO).toLocaleString('pt-BR');
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

      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>

          <div className="flex-1">
            <h1 className="text-xl font-bold">Meus Fiados</h1>
            <p className="text-sm text-gray-600">
              {pendentes.length} pendentes • {pagos.length} pagos
            </p>
          </div>

          <button onClick={carregarFiados}>
            <RefreshCw className={`w-5 h-5 ${loading && 'animate-spin'}`} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">

        {/* SALDO */}
        {totalPendente > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-5 rounded-xl mb-4">
            <p className="text-sm">Saldo Devedor</p>
            <p className="text-3xl font-bold">R$ {money(totalPendente)}</p>
          </div>
        )}

        {/* LISTA */}
        {loading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : fiadosFiltrados.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Nenhum fiado encontrado
          </div>
        ) : (
          fiadosFiltrados.map((fiado) => (
            <div key={fiado.id} className="bg-white rounded-xl mb-3 border">

              {/* HEADER */}
              <button
                onClick={() => setExpandido(expandido === fiado.id ? null : fiado.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">{formatarData(fiado.data)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${getCorStatus(fiado.status)}`}>
                      {getLabelStatus(fiado.status)}
                    </span>
                  </div>

                  <ChevronRight className={`${expandido === fiado.id && 'rotate-90'}`} />
                </div>

                <div className="grid grid-cols-3 mt-3 text-sm">
                  <div>R$ {money(fiado.valorTotal)}</div>
                  <div className="text-green-600">R$ {money(fiado.valorPago)}</div>
                  <div className="text-red-600">R$ {money(fiado.saldoAtual)}</div>
                </div>
              </button>

              {/* DETALHES */}
              {expandido === fiado.id && (
                <div className="p-4 border-t space-y-3">

                  {/* PRODUTOS */}
                  {fiado.produtos?.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{p.nome}</span>
                      <span>R$ {money(p.quantidade * p.precoUnitario)}</span>
                    </div>
                  ))}

                  {/* HISTÓRICO */}
                  {fiado.historicoPagamentos?.map((h, i) => (
                    <div key={i} className="text-xs text-gray-600">
                      {formatarDataHora(h.data)} - R$ {money(h.valor)}
                    </div>
                  ))}

                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
