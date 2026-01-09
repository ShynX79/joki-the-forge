// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Crown, Sword, Shield, Clock, Save, LogOut, Eye, LayoutDashboard, Loader2, Check, X, Power } from 'lucide-react';

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
  const [isOnline, setIsOnline] = useState(true); // State untuk status admin
  
  const [services, setServices] = useState<Item[]>([]);
  const [gamepasses, setGamepasses] = useState<Item[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/forge-gate'); 
        return;
      }
      
      // 1. Ambil Data Layanan
      const { data: sData } = await supabase.from('services').select('*').order('id');
      if (sData) setServices(sData);
      
      // 2. Ambil Data Gamepass
      const { data: gData } = await supabase.from('gamepasses').select('*').order('id');
      if (gData) setGamepasses(gData);

      // 3. Ambil Status Admin
      const { data: statusData } = await supabase.from('admin_status').select('is_online').eq('id', 1).single();
      if (statusData) setIsOnline(statusData.is_online);

      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/forge-gate');
  };

  // --- FITUR: TOGGLE STATUS ADMIN ---
  const handleToggleOnline = async () => {
    const newState = !isOnline;
    setIsOnline(newState); // Update UI Instan
    
    const { error } = await supabase.from('admin_status').update({ is_online: newState }).eq('id', 1);
    if (error) {
        alert("Gagal update status!");
        setIsOnline(!newState); // Balikin kalo gagal
    }
  };

  // --- EDIT HARGA ---
  const handleInputChange = (table: 'services' | 'gamepasses', id: number, value: string) => {
    if (table === 'services') {
      setServices(prev => prev.map(item => item.id === id ? { ...item, price: value } : item));
    } else {
      setGamepasses(prev => prev.map(item => item.id === id ? { ...item, price: value } : item));
    }
  };

  const handleSavePrice = async (table: 'services' | 'gamepasses', id: number, newPrice: string) => {
    const isConfirmed = window.confirm(`Simpan perubahan harga menjadi ${newPrice}?`);
    if (!isConfirmed) return;
    
    const btn = document.getElementById(`btn-${table}-${id}`);
    const originalContent = btn?.innerHTML;
    if (btn) btn.innerHTML = '<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

    const { error } = await supabase.from(table).update({ price: newPrice }).eq('id', id);
    
    if (error) alert("Gagal menyimpan!"); else alert("✅ Berhasil disimpan!");
    if (btn && originalContent) btn.innerHTML = originalContent;
  };

  // --- TOGGLE STOCK ---
  const handleToggleStock = async (id: number, currentStock: string | undefined) => {
    const newStatus = currentStock === 'Kosong' ? 'Ready' : 'Kosong';
    setGamepasses(prev => prev.map(item => item.id === id ? { ...item, stock: newStatus } : item));
    const { error } = await supabase.from('gamepasses').update({ stock: newStatus }).eq('id', id);
    if (error) {
        alert("Gagal update stok!");
        setGamepasses(prev => prev.map(item => item.id === id ? { ...item, stock: currentStock } : item));
    }
  };

  const jokiServices = services.filter(i => i.category !== 'System');
  const afkConfig = services.filter(i => i.category === 'System');
  const oreItems = gamepasses.filter(i => !i.name.startsWith('GP'));
  const gpItems = gamepasses.filter(i => i.name.startsWith('GP'));

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2"/> Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER ADMIN (Updated with Online Toggle) */}
        <div className="flex flex-col xl:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-lg gap-6">
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                <LayoutDashboard size={24} className="text-blue-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
                <p className="text-sm text-slate-400">Panel Kontrol Toko</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
            
            {/* TOMBOL STATUS TOKO */}
            <button 
                onClick={handleToggleOnline}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all active:scale-95 ${
                    isOnline 
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/50' 
                    : 'bg-red-950/50 border-red-500/50 text-red-400 hover:bg-red-900/50'
                }`}
            >
                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="font-bold text-sm tracking-wide w-20 text-center">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                <Power size={16} />
            </button>

            <div className="h-8 w-px bg-slate-800 mx-2 hidden sm:block"></div>

            <Link href="/" className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 bg-slate-900 rounded-lg text-slate-300 text-sm hover:text-white hover:bg-slate-800 transition font-medium">
                <Eye size={16}/> <span className="hidden sm:inline">Lihat Web</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg text-sm text-white transition font-medium shadow-lg shadow-red-900/20">
                <LogOut size={16}/> <span className="hidden sm:inline">Logout</span>
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
                        <button id={`btn-services-${item.id}`} onClick={() => handleSavePrice('services', item.id, item.price)} className="bg-slate-800 hover:bg-orange-600 p-2 rounded-lg text-slate-400 hover:text-white transition"><Save size={14}/></button>
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
                        <button id={`btn-services-${item.id}`} onClick={() => handleSavePrice('services', item.id, item.price)} className="bg-slate-800 hover:bg-emerald-600 p-2 rounded-lg text-slate-400 hover:text-white transition"><Save size={14}/></button>
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
                <thead className="text-slate-500 border-b border-slate-800/50">
                    <tr>
                        <th className="pb-2 font-medium">Item</th>
                        <th className="pb-2 font-medium text-center">Harga</th>
                        <th className="pb-2 font-medium text-center">Stok</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {oreItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-slate-300 font-medium">{item.name}</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                            <input type="text" value={item.price} onChange={(e) => handleInputChange('gamepasses', item.id, e.target.value)} className="bg-slate-950 border border-slate-700 px-2 py-1 rounded w-16 text-blue-400 text-center font-medium focus:border-blue-500 outline-none transition"/>
                            <button id={`btn-gamepasses-${item.id}`} onClick={() => handleSavePrice('gamepasses', item.id, item.price)} className="bg-slate-800 hover:bg-blue-600 p-1.5 rounded text-slate-400 hover:text-white transition"><Save size={12}/></button>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <button 
                            onClick={() => handleToggleStock(item.id, item.stock)}
                            className={`flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded font-bold uppercase text-[10px] transition-all active:scale-95 ${
                                item.stock === 'Kosong' 
                                ? 'bg-red-950 border border-red-900 text-red-500 hover:bg-red-900' 
                                : 'bg-emerald-950 border border-emerald-900 text-emerald-500 hover:bg-emerald-900'
                            }`}
                        >
                            {item.stock === 'Kosong' ? <X size={12}/> : <Check size={12}/>}
                            {item.stock === 'Kosong' ? 'Kosong' : 'Ready'}
                        </button>
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
                <thead className="text-slate-500 border-b border-slate-800/50">
                    <tr>
                        <th className="pb-2 font-medium">Item</th>
                        <th className="pb-2 font-medium text-center">Harga</th>
                        <th className="pb-2 font-medium text-center">Stok</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {gpItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-slate-300 font-medium">{item.name.replace('GP ', '')}</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                            <input type="text" value={item.price} onChange={(e) => handleInputChange('gamepasses', item.id, e.target.value)} className="bg-slate-950 border border-slate-700 px-2 py-1 rounded w-16 text-purple-400 text-center font-bold focus:border-purple-500 outline-none transition"/>
                            <button id={`btn-gamepasses-${item.id}`} onClick={() => handleSavePrice('gamepasses', item.id, item.price)} className="bg-slate-800 hover:bg-purple-600 p-1.5 rounded text-slate-400 hover:text-white transition"><Save size={12}/></button>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <button 
                            onClick={() => handleToggleStock(item.id, item.stock)}
                            className={`flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded font-bold uppercase text-[10px] transition-all active:scale-95 ${
                                item.stock === 'Kosong' 
                                ? 'bg-red-950 border border-red-900 text-red-500 hover:bg-red-900' 
                                : 'bg-emerald-950 border border-emerald-900 text-emerald-500 hover:bg-emerald-900'
                            }`}
                        >
                            {item.stock === 'Kosong' ? <X size={12}/> : <Check size={12}/>}
                            {item.stock === 'Kosong' ? 'Kosong' : 'Ready'}
                        </button>
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