// src/app/forge-gate/page.tsx  <-- Pastikan ini path filenya
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Login Gagal: ' + error.message);
      setLoading(false);
    } else {
      // Sukses login -> Masuk ke Admin
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Kembali ke Toko
        </Link>
        
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
                <div className="bg-blue-600/20 border border-blue-500/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-blue-500" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                <p className="text-slate-400 text-sm mt-2">Area terbatas.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                        placeholder="admin@example.com"
                        required 
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" size={20}/> : 'Buka Gerbang'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}