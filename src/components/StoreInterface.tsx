// src/components/StoreInterface.tsx
"use client";

import { useState } from 'react';
import { ShoppingCart, X, Copy, ExternalLink, Trash2, CheckCircle2, Clock, Minus, Plus, MessageCircle } from 'lucide-react';

// 1. Definisikan Tipe Data Item
interface Item {
  id: number;
  type: 'service' | 'gamepass' | 'afk';
  name: string;
  price: string;
  category?: string;
  stock?: string;
}

interface StoreInterfaceProps {
  services: any[];
  gamepasses: any[];
}

export default function StoreInterface({ services, gamepasses }: StoreInterfaceProps) {
  const [cart, setCart] = useState<Item[]>([]);
  
  // State Modal Keranjang
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Modal SUKSES (Pop-up baru pengganti alert)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  
  // State AFK
  const [afkHours, setAfkHours] = useState(1);

  // Filter Data
  const oreItems = gamepasses.filter((i: any) => !i.name.startsWith('GP'));
  const gpItems = gamepasses.filter((i: any) => i.name.startsWith('GP'));

  // --- LOGIC HELPER ---

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  const formatRupiah = (num: number) => {
    return "Rp " + num.toLocaleString('id-ID');
  };

  const calculateAfkPrice = (hours: number) => {
    if (hours === 1) return 25000;
    if (hours === 2) return 50000;
    if (hours === 3) return 55000;
    if (hours === 4) return 65000;
    if (hours === 5) return 75000;
    if (hours > 5) return 75000 + ((hours - 5) * 12000);
    return 0;
  };

  const currentAfkPrice = calculateAfkPrice(afkHours);

  // --- CART MANAGEMENT ---

  const toggleItem = (item: Item) => {
    const exists = cart.find((c) => c.id === item.id && c.type === item.type);
    if (exists) {
      setCart(cart.filter((c) => !(c.id === item.id && c.type === item.type))); 
    } else {
      setCart([...cart, item]);
    }
  };

  const addAfkToCart = () => {
    const afkItem: Item = {
      id: 9000 + afkHours,
      type: 'afk',
      name: `Joki AFK (${afkHours} Jam)`,
      price: formatRupiah(currentAfkPrice),
      category: 'Time Based'
    };
    if (!cart.find(c => c.id === afkItem.id)) {
      setCart([...cart, afkItem]);
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + parsePrice(item.price), 0);

  // --- PERBAIKAN LOGIC CHECKOUT ---
  const handleCheckout = () => {
    let message = "Halo Admin, saya mau order via Website:\n\n";
    cart.forEach((item, index) => {
      const cleanName = item.name.replace('GP ', ''); 
      let typeLabel = '';
      if(item.type === 'service') typeLabel = '[Jasa]';
      if(item.type === 'gamepass') typeLabel = '[Item]';
      if(item.type === 'afk') typeLabel = '[⏳ AFK]';
      message += `${index + 1}. ${typeLabel} ${cleanName} - ${item.price}\n`;
    });
    message += `\n💰 Total: *${formatRupiah(totalPrice)}*`;
    message += `\n\nMohon diproses ya min!`;

    navigator.clipboard.writeText(message).then(() => {
      // 1. Tutup keranjang
      setIsModalOpen(false);
      // 2. Buka Pop-up Instruksi (Bukan Alert Browser lagi)
      setIsSuccessOpen(true);
    }).catch(() => {
        alert("Gagal menyalin text.");
    });
  };

  // Fungsi Buka TikTok (Dipanggil dari Pop-up Sukses)
  const openTikTok = () => {
    window.open("https://www.tiktok.com/@imnotok_793", "_blank");
    setIsSuccessOpen(false); // Tutup pop-up setelah klik
    setCart([]); // Kosongkan keranjang (Opsional, biar reset)
  };

  // --- SUB-COMPONENT CARD ---
  const ItemCard = ({ item, colorTheme, type }: { item: Item, colorTheme: string, type: string }) => {
    const isSelected = cart.some((c) => c.id === item.id && c.type === item.type);
    let activeClass = isSelected 
      ? `border-${colorTheme}-500 bg-${colorTheme}-900/40 ring-1 ring-${colorTheme}-500` 
      : `border-slate-700/50 bg-slate-900/50`;
    
    // Manual Tailwind mapping
    if (colorTheme === 'orange' && isSelected) activeClass = "border-orange-500 bg-orange-900/40 ring-1 ring-orange-500";
    if (colorTheme === 'blue' && isSelected) activeClass = "border-blue-500 bg-blue-900/40 ring-1 ring-blue-500";
    if (colorTheme === 'purple' && isSelected) activeClass = "border-purple-500 bg-purple-900/40 ring-1 ring-purple-500";

    return (
      <div 
        onClick={() => toggleItem(item)}
        className={`cursor-pointer relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${activeClass}`}
      >
        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? `bg-${colorTheme}-500 border-${colorTheme}-500` : 'border-slate-600 bg-slate-950'}`}>
            {isSelected && <CheckCircle2 size={12} className="text-white" />}
        </div>
        <div className="mb-2 pr-6">
            <h4 className="font-medium text-white text-sm">{item.name.replace('GP ', '')}</h4>
            {type === 'service' && <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.category}</span>}
            {type === 'ore' && <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.stock === 'Kosong' ? 'border-red-900 text-red-400' : 'border-blue-900 text-blue-400'}`}>{item.stock}</span>}
        </div>
        <div className="mt-auto">
          <span className={`font-bold text-sm ${type === 'gp' ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {item.price}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. FLOATING CART BUTTON */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center animate-bounce-in">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full shadow-2xl shadow-orange-900/50 flex items-center gap-3 font-bold text-lg transition-transform hover:scale-105 active:scale-95"
            >
                <ShoppingCart className="fill-white" size={20} />
                <span>{cart.length} Item</span>
                <span className="bg-orange-800/50 px-2 py-0.5 rounded text-sm font-mono border border-orange-500/30">
                    {formatRupiah(totalPrice)}
                </span>
            </button>
        </div>
      )}

      {/* 2. MODAL KERANJANG BELANJA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <ShoppingCart size={20} className="text-orange-500" /> Ringkasan Pesanan
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-3">
                    {cart.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <div>
                                <p className="text-white text-sm font-medium">{item.name.replace('GP ', '')}</p>
                                <p className="text-emerald-400 text-xs font-mono">{item.price}</p>
                            </div>
                            <button onClick={() => toggleItem(item)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-slate-800 border-t border-slate-700 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-slate-300">Total Bayar:</span>
                        <span className="text-orange-400 text-xl font-mono">{formatRupiah(totalPrice)}</span>
                    </div>
                    <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                        <Copy size={18} />
                        <span>Salin Orderan</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 3. MODAL SUKSES / INSTRUKSI (BARU!) */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
             <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-green-500/30 shadow-2xl overflow-hidden text-center p-6 relative">
                {/* Hiasan Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
                
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                    <CheckCircle2 size={32} className="text-green-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Orderan Disalin!</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Teks orderan sudah tersalin otomatis. <br/>
                    Silakan klik tombol di bawah untuk membuka TikTok, lalu <b>PASTE (Tempel)</b> di DM Admin.
                </p>

                <button 
                    onClick={openTikTok}
                    className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 mb-3"
                >
                    <MessageCircle size={20} className="text-black" />
                    <span>Buka DM TikTok Admin</span>
                </button>

                <button 
                    onClick={() => setIsSuccessOpen(false)}
                    className="text-slate-500 text-sm hover:text-white transition"
                >
                    Tutup
                </button>
             </div>
        </div>
      )}

      {/* --- GRID TAMPILAN ITEM --- */}
      <section id="pricelist" className="py-16 bg-slate-900/50 border-y border-white/5">
        <div className="px-4 mx-auto max-w-[1400px]">
          <div className="mx-auto max-w-screen-md text-center mb-12">
            <h2 className="mb-4 text-3xl tracking-tight font-extrabold text-white">Daftar Layanan</h2>
            <p className="font-light text-slate-400 sm:text-xl">Klik item untuk menambahkannya ke keranjang.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-6">
                {/* MENU JOKI AFK */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 rounded-2xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition"></div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2 relative z-10">
                        <Clock size={20} /> Joki AFK
                    </h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-lg border border-slate-700">
                            <span className="text-slate-300 text-sm">Durasi (Jam)</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setAfkHours(Math.max(1, afkHours - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-white border border-slate-600"><Minus size={14} /></button>
                                <span className="font-bold text-white w-6 text-center">{afkHours}</span>
                                <button onClick={() => setAfkHours(Math.min(24, afkHours + 1))} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-white border border-slate-600"><Plus size={14} /></button>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-slate-500">Estimasi Harga</p>
                                <p className="text-2xl font-bold text-emerald-400 font-mono">{formatRupiah(currentAfkPrice)}</p>
                            </div>
                            <button onClick={addAfkToCart} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition">+ Keranjang</button>
                        </div>
                        <div className="text-[10px] text-slate-500 bg-slate-950/30 p-2 rounded border border-slate-800/50">💡 1 Jam 25K • 3 Jam 55K • 5 Jam 75K <br/>(Lebih dari 5 jam makin hemat!)</div>
                    </div>
                </div>

                {/* LIST JOKI BIASA */}
                <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col flex-grow shadow-lg">
                    <h3 className="text-xl font-bold text-orange-400 mb-4 border-b border-slate-700 pb-2">Joki Services</h3>
                    <div className="grid gap-3 content-start">
                        {services.map((item: any) => (
                            <ItemCard key={`s-${item.id}`} item={item} colorTheme="orange" type="service" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col h-full shadow-lg">
               <h3 className="text-xl font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2">Ore & Materials</h3>
               <div className="grid gap-3 content-start">
                {oreItems.map((item: any) => (
                   <ItemCard key={`g-${item.id}`} item={item} colorTheme="blue" type="ore" />
                ))}
               </div>
            </div>

            <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col h-full shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
               <h3 className="text-xl font-bold text-purple-400 mb-4 border-b border-slate-700 pb-2 relative z-10">Gamepass (Via Gift)</h3>
               <div className="grid gap-3 content-start relative z-10">
                {gpItems.map((item: any) => (
                   <ItemCard key={`g-${item.id}`} item={item} colorTheme="purple" type="gp" />
                ))}
               </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}