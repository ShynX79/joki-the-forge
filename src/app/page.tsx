// src/app/page.tsx
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Gamepad2, Scroll } from 'lucide-react';
import StoreInterface from '@/components/StoreInterface';

export const revalidate = 0; 

async function getData() {
  const { data: servicesData } = await supabase.from('services').select('*').order('id');
  const { data: gamepassesData } = await supabase.from('gamepasses').select('*').order('id');
  
  // AMBIL STATUS ADMIN
  const { data: statusData } = await supabase.from('admin_status').select('is_online').eq('id', 1).single();
  
  const services = servicesData?.map(item => ({ ...item, type: 'service' })) || [];
  const gamepasses = gamepassesData?.map(item => ({ ...item, type: 'gamepass' })) || [];
  const isOnline = statusData ? statusData.is_online : false;

  return { services, gamepasses, isOnline };
}

export default async function Home() {
  const { services, gamepasses, isOnline } = await getData();

  return (
    <main className="min-h-screen bg-slate-950 selection:bg-blue-900/50 selection:text-blue-100 font-sans">
      
      {/* --- NAVBAR PROFESIONAL --- */}
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-6 py-4">
          
          <Link href="/" className="flex items-center space-x-3 group relative z-50">
            <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-1.5 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="text-white w-5 h-5" />
            </div>
            <span className="self-center text-lg font-bold whitespace-nowrap text-white tracking-tight">
              LRP <span className="text-blue-400">Store</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
             <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Beranda</Link>
             <Link href="#pricelist" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Layanan</Link>
             <Link href="#testimoni" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Testimoni</Link>
          </div>
          
          <div className="flex items-center gap-3">
             {isOnline ? (
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium text-emerald-400">Admin Online</span>
                 </div>
             ) : (
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/30 border border-red-500/20 grayscale opacity-80">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-medium text-red-400">Admin Offline</span>
                 </div>
             )}
          </div>

        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 px-4 mx-auto max-w-screen-xl text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <ShieldCheck size={14} className="text-emerald-400" /> 
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Trusted Joki The Forge</span>
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight leading-tight text-white md:text-7xl drop-shadow-2xl">
            Dominasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">The Forge</span> <br/>
            Tanpa Batas.
          </h1>
          <p className="mb-10 text-lg font-normal text-slate-400 lg:text-xl sm:px-16 lg:px-48 max-w-3xl mx-auto leading-relaxed">
            Tingkatkan level, farming material langka, dan dapatkan item terbaik secara instan. 
            <span className="text-slate-200 font-semibold"> 100% Manual, Aman, & Cepat.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricelist" className="inline-flex justify-center items-center py-3 px-8 text-base font-bold text-center text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30 active:scale-95 cursor-pointer">
              Lihat Pricelist
              <Scroll className="ml-2 -mr-1 w-5 h-5" />
            </a>
            <a href="https://www.tiktok.com/@loremipsumestore" target="_blank" className="inline-flex justify-center items-center py-3 px-8 text-base font-bold text-slate-300 bg-slate-900/50 border border-slate-700 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
               Cek Testimoni
            </a>
          </div>
        </div>
      </section>

      {/* --- STORE INTERFACE (KIRIM DATA ONLINE DISINI) --- */}
      <StoreInterface services={services} gamepasses={gamepasses} isOnline={isOnline} />

      {/* --- FOOTER --- */}
      <footer id="testimoni" className="bg-slate-950 py-16 border-t border-slate-900 relative z-10">
        <div className="max-w-screen-xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2 space-y-4">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Gamepad2 className="text-blue-500" size={24} /> LRP Joki Store
             </h2>
             <p className="text-slate-500 max-w-xs leading-relaxed">
                Platform top-up dan joki terpercaya untuk The Forge Roblox. Kami mengutamakan keamanan akun dan kecepatan pengerjaan.
             </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Layanan</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#pricelist" className="hover:text-blue-400 transition">Joki Leveling</a></li>
              <li><a href="#pricelist" className="hover:text-blue-400 transition">Farming Material</a></li>
              <li><a href="#pricelist" className="hover:text-blue-400 transition">Item Gamepass</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Hubungi Kami</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <a href="https://www.tiktok.com/@imnotok_793" target="_blank" className="hover:text-white transition">Admin (ItsmeShynX)</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <a href="https://www.tiktok.com/@loremipsumestore" target="_blank" className="hover:text-white transition">Testimoni (LRP Store)</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto px-6 mt-12 pt-8 border-t border-slate-900 text-center md:text-left">
           <p className="text-slate-600 text-xs">© 2026 LRP Joki Store. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}