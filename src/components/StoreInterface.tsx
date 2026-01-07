// src/components/StoreInterface.tsx
"use client";

import { useState } from 'react';
import { ShoppingCart, X, Copy, Minus, Plus, MessageCircle, Flame, Hammer, Gem, Crown, Clock, CheckCircle2, PackageCheck } from 'lucide-react';

interface Item {
  id: number;
  type: 'service' | 'gamepass' | 'afk' | 'ore'; 
  name: string;
  price: string;
  category?: string;
  stock?: string;
}

interface CartItem {
  item: Item;
  quantity: number;
}

interface StoreInterfaceProps {
  services: any[];
  gamepasses: any[];
}

export default function StoreInterface({ services, gamepasses }: StoreInterfaceProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [afkHours, setAfkHours] = useState(1); 
  const [extraHours, setExtraHours] = useState(0);

  // --- FILTER DATA ---
  const displayedServices = services.filter((s: any) => s.category !== 'System');
  const afkConfig = services.filter((s: any) => s.category === 'System');

  const oreItems = gamepasses
    .filter((i: any) => !i.name.startsWith('GP'))
    .map((i: any) => ({ ...i, type: 'ore' })); 

  const gpItems = gamepasses
    .filter((i: any) => i.name.startsWith('GP'))
    .map((i: any) => ({ ...i, type: 'gamepass' }));

  // --- LOGIC HELPER ---
  const parsePrice = (priceStr: string) => parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  const formatRupiah = (num: number) => "Rp " + num.toLocaleString('id-ID');

  const getAfkRate = (key: string, defaultPrice: number) => {
    const found = afkConfig.find((s: any) => s.name === key);
    return found ? parsePrice(found.price) : defaultPrice;
  };

  const calculateAfkPrice = (base: number, extra: number) => {
    let price = 0;
    if (base === 1) price = getAfkRate('AFK 1 Jam', 20000);
    else if (base === 2) price = getAfkRate('AFK 2 Jam', 40000);
    else if (base === 3) price = getAfkRate('AFK 3 Jam', 55000);
    else if (base === 4) price = getAfkRate('AFK 4 Jam', 65000);
    else if (base === 5) price = getAfkRate('AFK 5 Jam', 75000);

    if (extra > 0) {
        const extraRate = getAfkRate('AFK Extra Per Jam', 15000);
        price += (extra * extraRate);
    }
    return price;
  };

  const calculateSavings = (hours: number) => {
    const price1h = getAfkRate('AFK 1 Jam', 20000); 
    const currentPrice = calculateAfkPrice(hours, 0); 
    const normalPrice = price1h * hours; 
    const savings = normalPrice - currentPrice;
    return savings > 0 ? savings : 0;
  };

  const currentAfkPrice = calculateAfkPrice(afkHours, extraHours);
  const currentSavings = calculateSavings(afkHours);

  // --- CART LOGIC ---
  const isMultiQtyItem = (item: Item) => item.type === 'ore' || item.name.toLowerCase().includes('raid') || item.name.toLowerCase().includes('boss');
  
  const getItemQty = (item: Item) => {
    const found = cart.find(c => c.item.id === item.id && c.item.type === item.type);
    return found ? found.quantity : 0;
  };

  const updateCart = (item: Item, delta: number) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(c => c.item.id === item.id && c.item.type === item.type);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingIndex].quantity + delta;
        if (newQty <= 0) newCart.splice(existingIndex, 1);
        else {
          if (!isMultiQtyItem(item) && newQty > 1) return prevCart;
          newCart[existingIndex].quantity = newQty;
        }
        return newCart;
      } else if (delta > 0) {
        return [...prevCart, { item, quantity: 1 }];
      }
      return prevCart;
    });
  };

  const addAfkToCart = () => {
    const isPackageMaxed = afkHours === 5 && extraHours > 0;
    const itemName = isPackageMaxed 
        ? `Joki AFK (Paket 5 Jam + ${extraHours} Jam Ekstra)` 
        : `Joki AFK (${afkHours} Jam)`;

    const uniqueId = 9000 + (afkHours * 100) + extraHours;

    const afkItemObj: Item = {
      id: uniqueId,
      type: 'afk',
      name: itemName,
      price: formatRupiah(currentAfkPrice),
      category: 'Time Based'
    };
    updateCart(afkItemObj, 1);
  };

  const handleAfkChange = (delta: number) => {
    const newVal = afkHours + delta;
    if (newVal >= 1 && newVal <= 5) {
        setAfkHours(newVal);
        if (newVal < 5) setExtraHours(0);
    }
  };

  const totalPrice = cart.reduce((acc, c) => acc + (parsePrice(c.item.price) * c.quantity), 0);
  const totalItems = cart.reduce((acc, c) => acc + c.quantity, 0);

  const handleCheckout = () => {
    let message = "🎮 *ORDERAN BARU* 🎮\n\nHalo Admin, saya mau order:\n\n";
    cart.forEach((c, index) => {
      const cleanName = c.item.name.replace('GP ', ''); 
      let typeLabel = '';
      if(c.item.type === 'service') typeLabel = '[🛠️ Jasa]';
      if(c.item.type === 'gamepass') typeLabel = '[👑 Item]';
      if(c.item.type === 'afk') typeLabel = '[⏳ AFK]';
      if(c.item.type === 'ore') typeLabel = '[💎 Material]';
      
      const totalItemPrice = parsePrice(c.item.price) * c.quantity;
      const qtyLabel = c.quantity > 1 ? `*${c.quantity}x* ` : '';

      message += `${index + 1}. ${typeLabel} ${qtyLabel}${cleanName} - ${formatRupiah(totalItemPrice)}\n`;
    });
    message += `\n💰 Total: *${formatRupiah(totalPrice)}*`;
    message += `\n\nMohon diproses min!`;

    navigator.clipboard.writeText(message).then(() => {
      setIsModalOpen(false);
      setIsSuccessOpen(true);
    }).catch(() => {
        alert("Gagal menyalin text.");
    });
  };

  const openTikTok = () => {
    window.open("https://www.tiktok.com/@imnotok_793", "_blank");
    setIsSuccessOpen(false);
    setCart([]); 
  };

  const ItemCard = ({ item, colorTheme, type }: { item: Item, colorTheme: string, type: string }) => {
    const qty = getItemQty(item);
    const isMulti = isMultiQtyItem(item);
    
    let cardClass = "bg-slate-900 border border-slate-800 hover:border-slate-600"; 
    let titleClass = "text-slate-200";
    let priceClass = "text-slate-300";
    let categoryClass = "text-slate-500 bg-slate-800";
    let btnClass = "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white";

    if (colorTheme === 'orange') { 
        titleClass = "text-orange-100 group-hover:text-orange-400";
        priceClass = "text-orange-400";
        categoryClass = "text-orange-300 bg-orange-900/30 border border-orange-500/20";
        if (qty > 0) {
            cardClass = "bg-orange-950/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]";
            btnClass = "bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-900/20";
        }
    }
    if (colorTheme === 'blue') { 
        titleClass = "text-blue-100 group-hover:text-cyan-300";
        priceClass = "text-cyan-400";
        categoryClass = "text-blue-300 bg-blue-900/30 border border-blue-500/20";
        if (qty > 0) {
            cardClass = "bg-blue-950/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
            btnClass = "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20";
        }
    }
    if (colorTheme === 'purple') { 
        titleClass = "text-purple-100 group-hover:text-fuchsia-300";
        priceClass = "text-yellow-400";
        categoryClass = "text-purple-300 bg-purple-900/30 border border-purple-500/20";
        if (qty > 0) {
            cardClass = "bg-purple-950/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]";
            btnClass = "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20";
        }
    }

    return (
      <div className={`relative flex flex-col justify-between p-4 rounded-xl transition-all duration-300 group ${cardClass}`}>
        <div className="flex justify-between items-start mb-3 cursor-pointer" onClick={() => !isMulti && updateCart(item, qty > 0 ? -1 : 1)}>
            <div className="pr-2">
                <h4 className={`font-bold text-sm tracking-tight transition-colors ${titleClass}`}>
                    {item.name.replace('GP ', '')}
                </h4>
                <div className="flex gap-2 mt-1.5">
                    {type === 'service' && <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${categoryClass}`}>{item.category}</span>}
                    {type === 'ore' && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.stock === 'Kosong' ? 'bg-red-950/50 text-red-400 border border-red-900' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900'}`}>{item.stock || 'Ready'}</span>}
                </div>
            </div>
            {!isMulti && (
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${qty > 0 ? `bg-${colorTheme}-500 border-${colorTheme}-500` : 'border-slate-700 bg-slate-800'}`}>
                    {qty > 0 && <CheckCircle2 size={12} className="text-white" />}
                </div>
            )}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className={`font-mono font-bold text-sm ${priceClass}`}>{item.price}</span>
          {isMulti ? (
             <div className={`flex items-center gap-1 rounded-lg p-1 border transition-colors ${qty > 0 ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'}`}>
                <button onClick={(e) => { e.stopPropagation(); updateCart(item, -1); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"><Minus size={14} /></button>
                <span className={`text-xs font-mono font-bold w-6 text-center ${qty > 0 ? 'text-white' : 'text-slate-600'}`}>{qty}</span>
                <button onClick={(e) => { e.stopPropagation(); updateCart(item, 1); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition"><Plus size={14} /></button>
             </div>
          ) : (
             <button onClick={() => updateCart(item, qty > 0 ? -1 : 1)} className={`text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md ${btnClass}`}>
                {qty > 0 ? 'Batal' : 'Ambil'}
             </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. FLOATING CART */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-0 right-0 z-50 px-4 flex justify-center animate-pop-in">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900/95 backdrop-blur-md border border-slate-700 hover:border-blue-500 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-blue-900/30 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 group"
            >
                <div className="relative">
                    <ShoppingCart className="text-blue-400 group-hover:text-blue-300 transition" size={22} />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm">{cart.reduce((a,c) => a + c.quantity, 0)}</span>
                </div>
                <div className="flex flex-col items-start leading-none gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Pesanan</span>
                    <span className="text-base font-bold font-mono text-blue-100">{formatRupiah(totalPrice)}</span>
                </div>
            </button>
        </div>
      )}

      {/* 2. MODAL KERANJANG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative ring-1 ring-white/10 animate-pop-in">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <ShoppingCart size={20} className="text-blue-500" /> Keranjang
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full text-slate-400 hover:text-white transition"><X size={18} /></button>
                </div>
                <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-950/50">
                    {cart.map((c) => (
                        <div key={`${c.item.type}-${c.item.id}`} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <div>
                                <p className="text-slate-200 text-sm font-bold">
                                    {c.quantity > 1 && <span className="text-blue-400 font-bold mr-1">{c.quantity}x</span>}
                                    {c.item.name.replace('GP ', '')}
                                </p>
                                <p className="text-blue-300/80 text-xs font-mono mt-0.5">@{c.item.price} {(c.quantity > 1) && `(Total: ${formatRupiah(parsePrice(c.item.price) * c.quantity)})`}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-950 rounded-lg border border-slate-800 p-1">
                                <button onClick={() => updateCart(c.item, -1)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"><Minus size={14}/></button>
                                <button onClick={() => updateCart(c.item, 1)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"><Plus size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold"><span className="text-slate-400 text-sm font-medium uppercase">Total Bayar</span><span className="text-blue-400 text-xl font-mono">{formatRupiah(totalPrice)}</span></div>
                    <button onClick={handleCheckout} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"><Copy size={18} /><span>Salin Orderan</span></button>
                </div>
            </div>
        </div>
      )}

      {/* 3. MODAL SUKSES */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
             <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden text-center p-8 relative ring-1 ring-blue-500/20 animate-pop-in">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/30">
                    <PackageCheck size={32} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Orderan Disalin!</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Teks orderan sudah ada di clipboard.<br/> 
                    Silakan <b>Paste (Tempel)</b> di DM Admin TikTok.
                </p>
                <div className="space-y-3">
                    <button onClick={openTikTok} className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"><MessageCircle size={20} /><span>Buka TikTok</span></button>
                    <button onClick={() => setIsSuccessOpen(false)} className="text-slate-500 text-sm hover:text-white transition font-medium">Tutup</button>
                </div>
             </div>
        </div>
      )}

      {/* --- GRID TAMPILAN ITEM --- */}
      <section id="pricelist" className="py-20 relative">
        <div className="px-4 mx-auto max-w-[1400px] relative z-10">
          
          <div className="mx-auto max-w-screen-md text-center mb-16">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 mb-4">Pilih Layanan</h2>
            <p className="text-slate-400 text-lg">Sesuaikan kebutuhan leveling dan materialmu.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="flex flex-col gap-6">
                
                {/* JOKI AFK WIDGET */}
                <div className="p-6 bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-800 rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 border-b border-emerald-900/30 pb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><Clock size={20} className="text-emerald-400"/></div>
                        <h3 className="text-xl font-bold text-emerald-100">Joki AFK</h3>
                    </div>
                    
                    <div className="space-y-5 relative z-10">
                        <div className="bg-black/20 p-4 rounded-xl border border-emerald-500/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-emerald-200/60 text-xs font-bold uppercase tracking-wider">Durasi Utama</span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">{afkHours === 5 ? 'MAX' : '1-5 JAM'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleAfkChange(-1)} className="w-10 h-10 flex items-center justify-center bg-emerald-950 rounded-lg hover:bg-emerald-900 text-emerald-400 border border-emerald-900 transition"><Minus size={16} /></button>
                                <span className="font-bold text-white w-full text-center font-mono text-2xl">{afkHours}h</span>
                                <button onClick={() => handleAfkChange(1)} disabled={afkHours >= 5} className="w-10 h-10 flex items-center justify-center bg-emerald-950 rounded-lg hover:bg-emerald-900 text-emerald-400 border border-emerald-900 transition disabled:opacity-30"><Plus size={16} /></button>
                            </div>
                            {currentSavings > 0 && (
                                <div className="mt-3 text-center animate-in fade-in slide-in-from-top-1">
                                    <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 text-[10px] px-3 py-1 rounded-full border border-red-500/20 font-bold uppercase tracking-wide">
                                        <Flame size={12} /> Hemat {formatRupiah(currentSavings)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {afkHours === 5 && (
                            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Plus size={12}/> Jam Ekstra</span>
                                    <span className="text-[10px] text-emerald-500 font-mono">15K/jam</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setExtraHours(Math.max(0, extraHours - 1))} className="w-8 h-8 flex items-center justify-center bg-emerald-950 rounded hover:bg-emerald-900 text-emerald-400 border border-emerald-900 transition"><Minus size={14} /></button>
                                    <span className="font-bold text-white w-full text-center font-mono">+{extraHours}h</span>
                                    <button onClick={() => setExtraHours(extraHours + 1)} className="w-8 h-8 flex items-center justify-center bg-emerald-950 rounded hover:bg-emerald-900 text-emerald-400 border border-emerald-900 transition"><Plus size={14} /></button>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-emerald-900/30">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Total Estimasi</p>
                                    <p className="text-3xl font-bold text-emerald-300 font-mono">{formatRupiah(currentAfkPrice)}</p>
                                </div>
                            </div>
                            <button onClick={addAfkToCart} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95">Ambil Paket</button>
                        </div>
                    </div>
                </div>

                {/* LIST JOKI BIASA */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h3 className="text-lg font-bold text-orange-400 mb-6 flex items-center gap-2 uppercase tracking-wide"><Hammer size={18} /> Joki Service</h3>
                    <div className="grid gap-4 content-start">
                        {displayedServices.map((item: any) => (
                            <ItemCard key={`s-${item.id}`} item={item} colorTheme="orange" type="service" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
               <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-wide"><Gem size={18} /> Ore & Rune</h3>
               <div className="grid gap-4 content-start">
                {oreItems.map((item: any) => (
                   <ItemCard key={`g-${item.id}`} item={item} colorTheme="blue" type="ore" />
                ))}
               </div>
            </div>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
               <h3 className="text-lg font-bold text-purple-400 mb-6 flex items-center gap-2 uppercase tracking-wide"><Crown size={18} /> Gamepass</h3>
               <div className="grid gap-4 content-start">
                {gpItems.map((item: any) => (
                   <ItemCard key={`g-${item.id}`} item={item} colorTheme="purple" type="gamepass" />
                ))}
               </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}