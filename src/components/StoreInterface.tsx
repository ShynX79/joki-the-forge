// src/components/StoreInterface.tsx
"use client";

import { useState } from 'react';
import { ShoppingCart, X, Copy, ExternalLink, Trash2, CheckCircle2, Clock, Minus, Plus, MessageCircle, Flame } from 'lucide-react';

// 1. Definisikan Tipe Data Item
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
  
  // STATE KHUSUS JOKI AFK
  const [afkHours, setAfkHours] = useState(1); // Max 5
  const [extraHours, setExtraHours] = useState(0); // Jam tambahan (Unlimited)

  // Filter Data
  const oreItems = gamepasses
    .filter((i: any) => !i.name.startsWith('GP'))
    .map((i: any) => ({ ...i, type: 'ore' })); 

  const gpItems = gamepasses
    .filter((i: any) => i.name.startsWith('GP'))
    .map((i: any) => ({ ...i, type: 'gamepass' }));

  // --- LOGIC HELPER ---

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  const formatRupiah = (num: number) => {
    return "Rp " + num.toLocaleString('id-ID');
  };

  // --- LOGIC HITUNG HARGA AFK (UPDATE HARGA BARU) ---
  const calculateAfkPrice = (base: number, extra: number) => {
    let price = 0;
    
    // 1. Hitung Paket Utama (Max 5 Jam)
    if (base === 1) price = 20000;       // BARU: 20k
    else if (base === 2) price = 40000;  // 2 x 20k
    else if (base === 3) price = 55000;  // Paket 3 Jam
    else if (base === 4) price = 65000;  // Interpolasi
    else if (base === 5) price = 75000;  // Paket 5 Jam

    // 2. Hitung Jam Tambahan (Tetap 15k/jam biar fair)
    if (extra > 0) {
        price += (extra * 15000);
    }
    
    return price;
  };

  const currentAfkPrice = calculateAfkPrice(afkHours, extraHours);
  const totalAfkDuration = afkHours + extraHours;

  // --- CART LOGIC ---

  const isMultiQtyItem = (item: Item) => {
    return item.type === 'ore' || item.name.toLowerCase().includes('raid') || item.name.toLowerCase().includes('boss');
  };

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

        if (newQty <= 0) {
          newCart.splice(existingIndex, 1); 
        } else {
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
    let message = "Halo Admin, saya mau order via Website:\n\n";
    cart.forEach((c, index) => {
      const cleanName = c.item.name.replace('GP ', ''); 
      let typeLabel = '';
      if(c.item.type === 'service') typeLabel = '[Jasa]';
      if(c.item.type === 'gamepass') typeLabel = '[Item]';
      if(c.item.type === 'afk') typeLabel = '[⏳ AFK]';
      if(c.item.type === 'ore') typeLabel = '[📦 Material]';
      
      const totalItemPrice = parsePrice(c.item.price) * c.quantity;
      const qtyLabel = c.quantity > 1 ? `*${c.quantity}x* ` : '';

      message += `${index + 1}. ${typeLabel} ${qtyLabel}${cleanName} - ${formatRupiah(totalItemPrice)}\n`;
    });
    message += `\n💰 Total: *${formatRupiah(totalPrice)}*`;
    message += `\n\nMohon diproses ya min!`;

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

  // --- CARD COMPONENT ---
  const ItemCard = ({ item, colorTheme, type }: { item: Item, colorTheme: string, type: string }) => {
    const qty = getItemQty(item);
    const isMulti = isMultiQtyItem(item);
    
    let activeClass = qty > 0
      ? `border-${colorTheme}-500 bg-${colorTheme}-900/40 ring-1 ring-${colorTheme}-500` 
      : `border-slate-700/50 bg-slate-900/50`;
    
    if (colorTheme === 'orange' && qty > 0) activeClass = "border-orange-500 bg-orange-900/40 ring-1 ring-orange-500";
    if (colorTheme === 'blue' && qty > 0) activeClass = "border-blue-500 bg-blue-900/40 ring-1 ring-blue-500";
    if (colorTheme === 'purple' && qty > 0) activeClass = "border-purple-500 bg-purple-900/40 ring-1 ring-purple-500";

    return (
      <div className={`relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 ${activeClass}`}>
        <div className="flex justify-between items-start mb-2" onClick={() => !isMulti && updateCart(item, qty > 0 ? -1 : 1)}>
            <div className="pr-6 cursor-pointer">
                <h4 className="font-medium text-white text-sm">{item.name.replace('GP ', '')}</h4>
                {type === 'service' && <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.category}</span>}
                {type === 'ore' && <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.stock === 'Kosong' ? 'border-red-900 text-red-400' : 'border-blue-900 text-blue-400'}`}>{item.stock}</span>}
            </div>
            {!isMulti && (
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${qty > 0 ? `bg-${colorTheme}-500 border-${colorTheme}-500` : 'border-slate-600 bg-slate-950'}`}>
                    {qty > 0 && <CheckCircle2 size={12} className="text-white" />}
                </div>
            )}
        </div>

        <div className="mt-auto flex items-end justify-between">
          <span className={`font-bold text-sm ${type === 'gamepass' ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {item.price}
          </span>

          {isMulti ? (
             <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-1 border border-slate-700">
                <button 
                    onClick={(e) => { e.stopPropagation(); updateCart(item, -1); }}
                    className={`w-6 h-6 flex items-center justify-center rounded hover:bg-slate-800 transition ${qty === 0 ? 'text-slate-600' : 'text-white'}`}
                >
                    <Minus size={14} />
                </button>
                <span className={`text-xs font-bold w-4 text-center ${qty > 0 ? 'text-white' : 'text-slate-500'}`}>{qty}</span>
                <button 
                    onClick={(e) => { e.stopPropagation(); updateCart(item, 1); }}
                    className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                    <Plus size={14} />
                </button>
             </div>
          ) : (
             <button 
                onClick={() => updateCart(item, qty > 0 ? -1 : 1)}
                className={`text-xs px-3 py-1 rounded font-bold transition ${qty > 0 ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
             >
                {qty > 0 ? 'Batal' : 'Ambil'}
             </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* FLOATING CART BUTTON */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center animate-bounce-in">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full shadow-2xl shadow-orange-900/50 flex items-center gap-3 font-bold text-lg transition-transform hover:scale-105 active:scale-95"
            >
                <ShoppingCart className="fill-white" size={20} />
                <span>{totalItems} Item</span>
                <span className="bg-orange-800/50 px-2 py-0.5 rounded text-sm font-mono border border-orange-500/30">
                    {formatRupiah(totalPrice)}
                </span>
            </button>
        </div>
      )}

      {/* MODAL KERANJANG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <ShoppingCart size={20} className="text-orange-500" /> Keranjang Belanja
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-3">
                    {cart.map((c) => (
                        <div key={`${c.item.type}-${c.item.id}`} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <div>
                                <p className="text-white text-sm font-medium">
                                    {c.quantity > 1 && <span className="text-orange-400 font-bold mr-1">{c.quantity}x</span>}
                                    {c.item.name.replace('GP ', '')}
                                </p>
                                <p className="text-emerald-400 text-xs font-mono">
                                    @{c.item.price} {(c.quantity > 1) && `(Total: ${formatRupiah(parsePrice(c.item.price) * c.quantity)})`}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updateCart(c.item, -1)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-white hover:bg-red-500/20 hover:text-red-400 transition"><Minus size={14}/></button>
                                <button onClick={() => updateCart(c.item, 1)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-white hover:bg-green-500/20 hover:text-green-400 transition"><Plus size={14}/></button>
                            </div>
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

      {/* MODAL SUKSES */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
             <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-green-500/30 shadow-2xl overflow-hidden text-center p-6 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                    <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Orderan Disalin!</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Silakan klik tombol di bawah untuk membuka TikTok, lalu <b>PASTE (Tempel)</b> di DM Admin.
                </p>
                <button onClick={openTikTok} className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 mb-3">
                    <MessageCircle size={20} className="text-black" />
                    <span>Buka DM TikTok Admin</span>
                </button>
                <button onClick={() => setIsSuccessOpen(false)} className="text-slate-500 text-sm hover:text-white transition">Tutup</button>
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
                
                {/* JOKI AFK */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 rounded-2xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition"></div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2 relative z-10">
                        <Clock size={20} /> Joki AFK
                    </h3>
                    
                    <div className="space-y-4 relative z-10">
                        {/* 1. Paket Utama (Max 5 Jam) */}
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-300 text-sm">Paket Utama</span>
                                <span className="text-xs text-slate-500">{afkHours === 5 ? 'Max Paket' : '1-5 Jam'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleAfkChange(-1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-white border border-slate-600"><Minus size={14} /></button>
                                <span className="font-bold text-white w-20 text-center">{afkHours} Jam</span>
                                <button onClick={() => handleAfkChange(1)} disabled={afkHours >= 5} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-white border border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"><Plus size={14} /></button>
                            </div>
                            
                            {/* INFO DISKON (Updated Prices) */}
                            {(afkHours === 3 || afkHours === 5) && (
                                <div className="mt-2 text-center animate-in fade-in slide-in-from-top-1">
                                    <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded border border-red-500/50 font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                        <Flame size={10} className="text-red-500 fill-red-500" />
                                        {afkHours === 3 ? 'Hemat Rp 5.000!' : 'Super Hemat Rp 25.000!'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 2. Jam Tambahan */}
                        {afkHours === 5 && (
                            <div className="bg-emerald-900/20 p-3 rounded-lg border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-emerald-300 text-sm flex items-center gap-1">
                                        <Plus size={12}/> Jam Ekstra
                                    </span>
                                    <span className="text-[10px] bg-emerald-900 text-emerald-400 px-1 rounded border border-emerald-500/50">+15K/jam</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setExtraHours(Math.max(0, extraHours - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-white border border-slate-600"><Minus size={14} /></button>
                                    <span className="font-bold text-white w-20 text-center">+{extraHours} Jam</span>
                                    <button onClick={() => setExtraHours(extraHours + 1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-white border border-slate-600"><Plus size={14} /></button>
                                </div>
                            </div>
                        )}

                        {/* Total Harga */}
                        <div className="flex justify-between items-end pt-2">
                            <div>
                                <p className="text-[10px] text-slate-500">
                                    Total Durasi: <span className="text-slate-300 font-bold">{totalAfkDuration} Jam</span>
                                </p>
                                <p className="text-2xl font-bold text-emerald-400 font-mono">{formatRupiah(currentAfkPrice)}</p>
                            </div>
                            <button onClick={addAfkToCart} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition">+ Keranjang</button>
                        </div>
                        <div className="text-[10px] text-slate-500 bg-slate-950/30 p-2 rounded border border-slate-800/50">
                            💡 1 Jam 20K • 5 Jam 75K <br/>
                            Lebih dari 5 jam cuma nambah 15K/jam.
                        </div>
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