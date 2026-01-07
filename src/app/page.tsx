// src/app/page.tsx
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Scroll, ShieldCheck, Gamepad2 } from 'lucide-react';
import StoreInterface from '@/components/StoreInterface';

export const revalidate = 0; 

async function getData() {
  const { data: servicesData } = await supabase.from('services').select('*').order('id');
  const { data: gamepassesData } = await supabase.from('gamepasses').select('*').order('id');
  
  const services = servicesData?.map(item => ({ ...item, type: 'service' })) || [];
  const gamepasses = gamepassesData?.map(item => ({ ...item, type: 'gamepass' })) || [];

  return { services, gamepasses };
}

export default async function Home() {
  const { services, gamepasses } = await getData();

  return (
    <main className="min-h-screen bg-slate-950 selection:bg-blue-900/50 selection:text-blue-100">
      
      {/* --- NAVBAR MODERN (TANPA TOMBOL LOGIN) --- */}
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-blue-600/20 border border-blue-500/30 p-1.5 rounded-lg">
              <Gamepad2 className="text-blue-500 w-5 h-5" />
            </div>
            <span className="self-center text-lg font-bold whitespace-nowrap text-white tracking-tight">
              LoremIpsum <span className="text-blue-500">Store</span>
            </span>
          </Link>
          
          {/* UBAH: Bagian tombol Login dihapus total agar tidak terlihat public */}
          <div className="hidden md:block">
             {/* Kosong: Hanya kamu yang tau link login nya */}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION MODERN --- */}
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

        <div className="relative z-10 px-4 mx-auto max-w-screen-xl text-center">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-950/50 border border-blue-800/50 text-sm text-blue-400 mb-6 font-medium animate-in fade-in slide-in-from-bottom-2">
            <ShieldCheck size={14} /> Trusted Joki & Items
          </span>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight leading-none text-white md:text-6xl lg:text-7xl">
            Level Up Your Game in <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              The Forge Roblox
            </span>
          </h1>
          <p className="mb-8 text-lg font-normal text-slate-400 lg:text-xl sm:px-16 lg:px-48 max-w-3xl mx-auto">
            Tingkatkan karaktermu dengan cepat dan aman. Kami menyediakan layanan joki profesional dan material langka dengan proses 100% manual tanpa script.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a href="#pricelist" className="inline-flex justify-center items-center py-3 px-8 text-base font-bold text-center text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30 active:scale-95">
              Lihat Pricelist
              <Scroll className="ml-2 -mr-1 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* --- STORE INTERFACE --- */}
      <StoreInterface services={services} gamepasses={gamepasses} />

      {/* --- FOOTER MODERN --- */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800/50 mb-24 md:mb-0 relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 text-center md:flex md:justify-between md:items-center md:text-left">
          <div className="mb-8 md:mb-0">
             <h2 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2 mb-2">
                <Gamepad2 className="text-blue-500" size={18} /> LoremIpsum Store
             </h2>
             <p className="text-slate-500 text-sm max-w-xs mx-auto md:mx-0">
                Solusi terbaik untuk kebutuhan grinding The Forge kamu. Cepat, aman, dan terpercaya.
             </p>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-slate-400">
              📺 TikTok: <a href="https://tiktok.com/@imnotok_793" target="_blank" className="text-blue-400 hover:text-blue-300 transition font-medium">@imnotok_793</a>
            </p>
            <p className="text-slate-400">
              ⭐ Testimoni: <span className="text-emerald-400 font-medium">LoremIpsum Guild</span>
            </p>
             <p className="text-slate-600 text-xs mt-4 md:mt-2">© 2024 LoremIpsum Store. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}