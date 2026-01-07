// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Crown, Sword, Shield, Clock, Save, LogOut, Eye, LayoutDashboard, Loader2 } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  price: string;
  category?: string;
  stock?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [services, setServices] = useState<Item[]>([]);
  const [gamepasses, setGamepasses] = useState<Item[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // PERBAIKAN: Redirect ke folder rahasia (bukan /login lagi)
        router.push('/forge-gate'); 
        return;
      }
      const { data: sData } = await supabase.from('services').select('*').order('id');
      if (sData) setServices(sData);
      const { data: gData } = await supabase.from('gamepasses').select('*').order('id');
      if (gData) setGamepasses(gData);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // PERBAIKAN: Redirect ke folder rahasia setelah logout
    router.push('/forge-gate');
  };

  const handleInputChange = (table: 'services' | 'gamepasses', id: number, value: string) => {
    if (table === 'services') {
      setServices(prev => prev.map(item => item.id === id ? { ...item, price: value } : item));
    } else {
      setGamepasses(prev => prev.map(item => item.id === id ? { ...item, price: value } : item));
    }
  };

  const handleSave = async (table: 'services' | 'gamepasses', id: number, newPrice: string) => {
    const isConfirmed = window.confirm(`Simpan perubahan harga menjadi ${newPrice}?`);
    if (!isConfirmed) return;
    
    const btn = document.getElementById(`btn-${table}-${id}`);
    const originalContent = btn?.innerHTML;
    
    // Tampilkan loading spinner di tombol
    if (btn) btn.innerHTML = '<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

    const { error } = await supabase.from(table).update({ price: newPrice }).eq('id', id);
    
    if (error) alert("Gagal menyimpan!"); else alert("✅ Berhasil disimpan!");
    
    // Kembalikan icon tombol save
    if (btn && originalContent) btn.innerHTML = originalContent;
  };

  const jokiServices = services.filter(i => i.category !== 'System');
  const afkConfig = services.filter(i => i.category === 'System');
  const oreItems = gamepasses.filter(i => !i.name.startsWith('GP'));
  const gpItems = gamepasses.filter(i => i.name.startsWith('GP'));

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2"/> Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                <LayoutDashboard size={24} className="text-blue-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
                <p className="text-sm text-slate-400">Panel Kontrol Harga & Stok</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-900 rounded-lg text-slate-300 text-sm hover:text-white hover:bg-slate-800 transition font-medium">
                <Eye size={16}/> View Site
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm text-white transition font-medium shadow-lg shadow-red-900/20">
                <LogOut size={16}/> Logout
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* TABEL 1: JOKI */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <h2 className="text-base font-bold mb-4 text-orange-400 flex items-center gap-2 uppercase tracking-wider"><Sword size={16}/> Joki Services</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-800/50">
                  {jokiServices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-slate-300 font-medium">{item.name}</td>
                      <td className="p-2 flex items-center gap-2 justify-end">
                        <input type="text" value={item.price} onChange={(e) => handleInputChange('services', item.id, e.target.value)} className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg w-24 text-orange-400 text-center font-medium focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"/>
                        <button id={`btn-services-${item.id}`} onClick={() => handleSave('services', item.id, item.price)} className="bg-slate-800 hover:bg-orange-600 p-2 rounded-lg text-slate-400 hover:text-white transition"><Save size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 2: AFK */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <h2 className="text-base font-bold mb-4 text-emerald-400 flex items-center gap-2 uppercase tracking-wider"><Clock size={16}/> AFK Config</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-800/50">
                  {afkConfig.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-slate-300 font-medium">{item.name}</td>
                      <td className="p-2 flex items-center gap-2 justify-end">
                        <input type="text" value={item.price} onChange={(e) => handleInputChange('services', item.id, e.target.value)} className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg w-24 text-emerald-400 text-center font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"/>
                        <button id={`btn-services-${item.id}`} onClick={() => handleSave('services', item.id, item.price)} className="bg-slate-800 hover:bg-emerald-600 p-2 rounded-lg text-slate-400 hover:text-white transition"><Save size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 3: ORE */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <h2 className="text-base font-bold mb-4 text-blue-400 flex items-center gap-2 uppercase tracking-wider"><Shield size={16}/> Ore & Rune</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-800/50">
                  {oreItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-slate-300 font-medium">{item.name}</td>
                      <td className="p-2 flex items-center gap-2 justify-end">
                        <input type="text" value={item.price} onChange={(e) => handleInputChange('gamepasses', item.id, e.target.value)} className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg w-24 text-blue-400 text-center font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"/>
                        <button id={`btn-gamepasses-${item.id}`} onClick={() => handleSave('gamepasses', item.id, item.price)} className="bg-slate-800 hover:bg-blue-600 p-2 rounded-lg text-slate-400 hover:text-white transition"><Save size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

           {/* TABEL 4: GAMEPASS */}
           <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <h2 className="text-base font-bold mb-4 text-purple-400 flex items-center gap-2 uppercase tracking-wider"><Crown size={16}/> Gamepass</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-800/50">
                  {gpItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-slate-300 font-medium">{item.name.replace('GP ', '')}</td>
                      <td className="p-2 flex items-center gap-2 justify-end">
                        <input type="text" value={item.price} onChange={(e) => handleInputChange('gamepasses', item.id, e.target.value)} className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg w-24 text-purple-400 text-center font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"/>
                         <button id={`btn-gamepasses-${item.id}`} onClick={() => handleSave('gamepasses', item.id, item.price)} className="bg-slate-800 hover:bg-purple-600 p-2 rounded-lg text-slate-400 hover:text-white transition"><Save size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}