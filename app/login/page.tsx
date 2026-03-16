'use client';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cpf;
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return telefone;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    const cpfNumeros = cpf.replace(/\D/g, '');
    const telNumeros = telefone.replace(/\D/g, '');
    
    if (cpfNumeros.length !== 11) {
      setErro('CPF inválido');
      return;
    }
    
    if (telNumeros.length < 10) {
      setErro('Telefone inválido');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('https://seu-admin.vercel.app/api/clientes/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfNumeros, telefone: telNumeros }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('cliente', JSON.stringify(data));
        window.location.href = '/';
      } else {
        const error = await res.json();
        setErro(error.error || 'CPF ou telefone não encontrado');
      }
    } catch (err) {
      setErro('Erro ao conectar. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Orlando Mercado</h1>
        <p className="text-center text-gray-600 mb-8">Área do Cliente</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(formatarCPF(e.target.value))}
              className="w-full h-12 px-4 bg-gray-100 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-semibold"
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              className="w-full h-12 px-4 bg-gray-100 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-semibold"
              placeholder="(83) 99999-9999"
              maxLength={15}
            />
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-semibold text-center">{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !cpf || !telefone}
            className="w-full h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-lg transition-all active:scale-95"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Primeira vez? Entre em contato com o mercado para cadastrar seus dados.
          </p>
        </div>
      </div>
    </div>
  );
}
