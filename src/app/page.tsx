// src/app/page.tsx
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Sword, Zap } from 'lucide-react';
import StoreInterface from '@/components/StoreInterface';

export const revalidate = 0; 

export const metadata = {
  title: 'LoremIpsum Store | Joki The Forge Terpercaya',
  description: 'Store joki The Forge terbaik, murah dan cepat. 100% Manual No Script.',
};

async function getData() {
  const { data: servicesData } = await supabase.from('services').select('*').order('id');
  const { data: gamepassesData } = await supabase.from('gamepasses').select('*').order('id');
  
  // Suntikkan 'type' agar ID tidak bentrok
  const services = servicesData?.map(item => ({ ...item, type: 'service' })) || [];
  const gamepasses = gamepassesData?.map(item => ({ ...item, type: 'gamepass' })) || [];

  return { services, gamepasses };
}

export default async function Home() {
  const { services, gamepasses } = await getData();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-orange-500 selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Sword className="text-white w-5 h-5" />
            </div>
            <span className="self-center text-xl font-bold whitespace-nowrap text-white">
              LoremIpsum <span className="text-orange-500">Store</span>
            </span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <Link href="/login" className="text-white bg-orange-600 hover:bg-orange-700 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors">
              Login Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 px-4 mx-auto max-w-screen-xl text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-slate-800 border border-slate-700 text-sm text-orange-400 mb-6 font-medium">
            🚀 Jasa Joki Terpercaya by LoremIpsum
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-6xl lg:text-7xl">
            Dominasi World di <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
              The Forge Roblox
            </span>
          </h1>
          <p className="mb-8 text-lg font-normal text-slate-400 lg:text-xl sm:px-16 lg:px-48">
            Pilih item di bawah, masukkan keranjang, dan order otomatis via TikTok!
            <br className="hidden md:block"/>
            Proses manual tanpa script berbahaya, dijamin 100% Aman.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a href="#pricelist" className="inline-flex justify-center items-center py-3 px-6 text-base font-medium text-center text-white rounded-lg bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:ring-orange-900 transition-all">
              Mulai Belanja
              <Zap className="ml-2 -mr-1 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* --- STORE INTERFACE --- */}
      <StoreInterface services={services} gamepasses={gamepasses} />

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 py-10 border-t border-slate-800 mb-24 md:mb-0">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <div className="mb-8 space-y-3">
            <span className="inline-block py-1.5 px-4 rounded bg-green-900/20 text-green-400 border border-green-800/50 text-sm font-bold tracking-wide">
              ✅ 100% MANUAL – NO SCRIPT
            </span>
            <p className="text-slate-400 text-sm mt-4">
              {/* Update Nama TikTok Disini */}
              📺 Live TikTok: <span className="text-white font-bold cursor-pointer hover:text-orange-500 transition">ItsMeShynX (@imnotok_793)</span> | YT: <span className="text-white font-bold cursor-pointer">XynN</span>
            </p>
            <p className="text-slate-500 text-xs">
              ⭐ Testimoni: <span className="text-orange-500 font-bold">LoremIpsum</span>
            </p>
          </div>
          <p className="text-slate-600 mb-4 text-sm">© 2024 LoremIpsum Store. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}