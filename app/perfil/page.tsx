'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, CreditCard, LogOut, Shield } from 'lucide-react';

export default function Perfil() {
  const [cliente, setCliente] = useState<any>(null);

  useEffect(() => {
    const clienteData = localStorage.getItem('cliente');
    if (clienteData) {
      setCliente(JSON.parse(clienteData));
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Deseja sair da sua conta?')) {
      localStorage.removeItem('cliente');
      window.location.href = '/login';
    }
  };

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (tel: string) => {
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/">
              <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center active:scale-95 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-xl font-bold">Meu Perfil</h1>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold">{cliente.nome}</h2>
            <p className="text-purple-100">Cliente Orlando Mercado</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Informações Pessoais */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informações Pessoais</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Nome Completo</p>
                <p className="font-semibold text-gray-900">{cliente.nome}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">CPF</p>
                <p className="font-semibold text-gray-900 font-mono">
                  {formatarCPF(cliente.cpf)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Telefone</p>
                <p className="font-semibold text-gray-900 font-mono">
                  {formatarTelefone(cliente.telefone)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">ID do Cliente</p>
                <p className="font-semibold text-gray-900 font-mono">{cliente.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu de Ações */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 px-6 py-4 border-b border-gray-200">
            Ações
          </h3>
          
          <div className="divide-y divide-gray-200">
            <Link href="/catalogo">
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-900">Ver Catálogo</span>
                <span className="text-gray-400">→</span>
              </button>
            </Link>

            <Link href="/fiados">
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-900">Meus Fiados</span>
                <span className="text-gray-400">→</span>
              </button>
            </Link>

            <Link href="/conta-corrente">
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-900">Conta Corrente</span>
                <span className="text-gray-400">→</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Botão Sair */}
        <button
          onClick={handleLogout}
          className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Precisa atualizar seus dados?
          </p>
          <p className="text-sm text-gray-600">
            Entre em contato com o Orlando Mercado
          </p>
        </div>

        {/* Versão */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Orlando Mercado - App Clientes
          </p>
          <p className="text-xs text-gray-400">
            Versão 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
