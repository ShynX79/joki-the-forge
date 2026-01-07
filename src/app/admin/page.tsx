// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Crown, Sword, Shield } from 'lucide-react';

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
  const [user, setUser] = useState<any>(null);
  
  const [services, setServices] = useState<Item[]>([]);
  const [gamepasses, setGamepasses] = useState<Item[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

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
    router.push('/login');
  };

  const updateItem = async (table: 'services' | 'gamepasses', id: number, field: string, value: string) => {
    if (table === 'services') {
      setServices(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    } else {
      setGamepasses(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    }

    const { error } = await supabase.from(table).update({ [field]: value }).eq('id', id);
    if (error) console.error(error);
  };

  // Filter untuk Admin View
  const oreItems = gamepasses.filter(i => !i.name.startsWith('GP'));
  const gpItems = gamepasses.filter(i => i.name.startsWith('GP'));

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-orange-500">Dashboard Admin</h1>
            <p className="text-sm text-slate-400">Manage LoremIpsum Store</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/" className="px-4 py-2 border border-slate-600 rounded text-slate-300 text-sm hover:text-white">View Live Site</Link>
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded text-sm hover:bg-red-700 text-white">Logout</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* TABEL 1: JOKI (Services) */}
          <div className="bg-slate-900 p-5 rounded-xl border border-orange-500/20">
            <h2 className="text-lg font-bold mb-4 text-orange-400 flex items-center gap-2"><Sword size={18}/> Joki Services</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-800">
                  {services.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50">
                      <td className="p-2 py-3">
                        <div className="font-medium text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.category}</div>
                      </td>
                      <td className="p-2">
                        <input type="text" defaultValue={item.price} onBlur={(e) => updateItem('services', item.id, 'price', e.target.value)} className="bg-slate-950 border border-slate-700 px-2 py-1 rounded w-20 text-emerald-400 text-center"/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 2: ORE & MATERIALS (Gamepasses Table - Filter !GP) */}
          <div className="bg-slate-900 p-5 rounded-xl border border-blue-500/20">
            <h2 className="text-lg font-bold mb-4 text-blue-400 flex items-center gap-2"><Shield size={18}/> Ore & Materials</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-800">
                  {oreItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50">
                      <td className="p-2 py-3 font-medium text-slate-200">{item.name}</td>
                      <td className="p-2">
                        <input type="text" defaultValue={item.price} onBlur={(e) => updateItem('gamepasses', item.id, 'price', e.target.value)} className="bg-slate-950 border border-slate-700 px-2 py-1 rounded w-20 text-emerald-400 text-center"/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

           {/* TABEL 3: GAMEPASS (Gamepasses Table - Filter GP) */}
           <div className="bg-slate-900 p-5 rounded-xl border border-purple-500/20">
            <h2 className="text-lg font-bold mb-4 text-purple-400 flex items-center gap-2"><Crown size={18}/> Gamepass List</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-800">
                  {gpItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50">
                      <td className="p-2 py-3 font-medium text-slate-200">{item.name.replace('GP ', '')}</td>
                      <td className="p-2">
                        <input type="text" defaultValue={item.price} onBlur={(e) => updateItem('gamepasses', item.id, 'price', e.target.value)} className="bg-slate-950 border border-slate-700 px-2 py-1 rounded w-20 text-yellow-400 text-center font-bold"/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[10px] text-slate-500 italic text-center">
                *Item masuk ke sini jika nama diawali "GP"
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}