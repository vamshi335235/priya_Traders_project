import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Leaf, Clock, MapPin, Trash2, ArrowRight, Plus, Minus, CheckCircle2, Phone, Instagram, Facebook, Mail, MessageCircle, CheckCircle, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from './assets/log.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WHATSAPP_NUMBER = '919059757657'; // Updated to your new number

const FALLBACK_PRODUCTS = [
    {
        _id: 'fallback-1',
        name: 'Premium Idly Batter',
        description: 'Stone-ground, naturally fermented, home-style batter for soft and fluffy idlis.',
        price: 60,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
        category: 'Batter',
        maker: 'Priya Traders - Home Made'
    },
    {
        _id: 'fallback-2',
        name: 'Crispy Dosa Batter',
        description: 'Perfectly balanced batter for restaurant-style thin and crispy golden dosas.',
        price: 70,
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=800',
        category: 'Batter',
        maker: 'Priya Traders - Home Made'
    }
];

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=1200", // Dosa
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=1200"  // Idly
];

function App() {
    const [products, setProducts] = useState(FALLBACK_PRODUCTS);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [localQuantities, setLocalQuantities] = useState({ 'fallback-1': 1, 'fallback-2': 1 });
    const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

    // Checkout Form State
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchProducts();
        const timer = setInterval(() => {
            setCurrentHeroIdx(prev => (prev + 1) % HERO_IMAGES.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            if (res.data && res.data.length > 0) {
                setProducts(res.data);
                const initialQty = {};
                res.data.forEach(p => initialQty[p._id] = 1);
                setLocalQuantities(initialQty);
            }
        } catch (err) {
            console.log('Using local stock data...');
        }
    };

    const updateLocalQty = (id, delta) => {
        setLocalQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
    };

    const addToCart = (product) => {
        const qtyToAdd = localQuantities[product._id] || 1;
        setCart(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + qtyToAdd } : item);
            }
            return [...prev, { ...product, quantity: qtyToAdd }];
        });
        setLocalQuantities(prev => ({ ...prev, [product._id]: 1 }));
        setIsCartOpen(true);
    };

    const updateCartQty = (id, delta) => {
        setCart(prev => prev.map(item => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item._id !== id));
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
            alert("Please fill in all your details so we can deliver your order!");
            return;
        }

        const orderData = {
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone.startsWith('91') ? customerInfo.phone : `91${customerInfo.phone.replace(/\D/g, '')}`,
            deliveryAddress: customerInfo.address,
            items: cart.map(item => ({
                productId: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: cartTotal
        };

        try {
            console.log("Placing order with data:", orderData);
            const response = await axios.post(`${API_URL}/orders`, orderData);
            console.log("Order saved successfully:", response.data);

            setCart([]);
            setCustomerInfo({ name: '', phone: '', address: '' });
            setIsCartOpen(false);
            setIsOrderSuccess(true);

            // Auto-hide success message after 6 seconds
            setTimeout(() => setIsOrderSuccess(false), 6000);
        } catch (err) {
            console.error("API Error during order placement:", err);
            alert("Error: " + (err.response?.data?.message || "Could not connect to the server. Please check if your internet or server is running."));
        }
    };

    return (
        <div className="min-h-screen bg-[#fcf9f2] overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-[100] px-3 md:px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-xl border border-white/20 rounded-[20px] md:rounded-[24px] shadow-sm px-4 md:px-8 py-3">
                    <div className="flex items-center gap-2 md:gap-3">
                        {logo ? (
                            <img src={logo} alt="Priya Traders Logo" className="h-8 md:h-12 w-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
                        ) : null}
                        <h2 className="text-lg md:text-2xl font-bold tracking-tighter shrink-0">
                            <span className="text-[#2d5a27]">PRIYA</span> <span className="text-[#f39200]">TRADERS</span>
                        </h2>
                    </div>

                    <div className="hidden lg:flex items-center gap-10 font-bold text-sm tracking-widest text-gray-500">
                        <a href="#home" className="hover:text-[#2d5a27] transition-colors">HOME</a>
                        <a href="#products" className="hover:text-[#2d5a27] transition-colors">PRODUCTS</a>
                        <a href="#about" className="hover:text-[#2d5a27] transition-colors">OUR STORY</a>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button onClick={() => setIsCartOpen(true)} className="relative p-2 md:p-3 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors group">
                            <ShoppingCart size={18} className="md:size-[22px] text-[#f39200] group-hover:scale-110 transition-transform" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-500"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-24 left-3 right-3 bg-white rounded-[20px] shadow-2xl p-6 lg:hidden border border-gray-100 ring-1 ring-black/5"
                        >
                            <div className="flex flex-col gap-6 font-bold text-sm tracking-[0.2em] text-gray-800 text-center">
                                <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>HOME</a>
                                <a href="#products" onClick={() => setIsMobileMenuOpen(false)}>PRODUCTS</a>
                                <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>OUR STORY</a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Success Notification */}
            <AnimatePresence>
                {isOrderSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-white border-2 border-[#2d5a27] px-6 md:px-8 py-3 md:py-4 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 w-[90%] md:w-auto"
                    >
                        <div className="bg-[#2d5a27] p-1.5 md:p-2 rounded-full text-white shrink-0">
                            <CheckCircle size={20} className="md:size-6" />
                        </div>
                        <div>
                            <p className="font-black text-[10px] md:text-xs tracking-widest uppercase">Order Placed Successfully!</p>
                            <p className="text-gray-400 text-[8px] md:text-[10px] font-bold">Our team will contact you shortly.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section id="home" className="pt-24 md:pt-40 pb-12 md:pb-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 md:gap-16 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2d5a27]/10 text-[#2d5a27] rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 md:mb-6">
                            <Leaf size={12} /> Fresh Daily. Local Makers.
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 md:mb-8 leading-tight lg:leading-[0.9] font-serif">
                            Purely Fresh <br className="hidden sm:block" /><span className="text-[#2d5a27]">Idly & Dosa</span> <br className="hidden sm:block" /><span className="text-[#f39200]">Batter.</span>
                        </h1>
                        <p className="text-gray-500 text-base md:text-xl font-medium mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed italic">"Deliciously pure and fresh batter delivered to your doorstep every morning."</p>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-5 justify-center lg:justify-start">
                            <a href="#products" className="bg-[#2d5a27] text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-sm flex justify-center items-center gap-2 hover:shadow-2xl hover:shadow-[#2d5a27]/30 transition-all">ORDER FRESH TODAY <ArrowRight size={18} /></a>
                            <div className="flex items-center justify-center gap-2 text-gray-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest shrink-0"><MapPin size={14} className="text-[#f39200]" /> Hyderabad Doorstep Delivery</div>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="flex-1 w-full max-w-2xl lg:max-w-none">
                        <div className="relative group overflow-hidden rounded-[30px] md:rounded-[60px] shadow-2xl h-[300px] sm:h-[450px] lg:h-[600px] bg-gray-100">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentHeroIdx}
                                    src={HERO_IMAGES[currentHeroIdx]}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="w-full h-full object-cover"
                                    alt="Fresh Food"
                                />
                            </AnimatePresence>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                {HERO_IMAGES.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${currentHeroIdx === i ? 'w-8 bg-[#f39200]' : 'w-2 bg-white/50'}`} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-12 md:py-24 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 text-center">
                    {[
                        { icon: <Leaf className="text-[#2d5a27]" />, title: 'LOCAL PARTNERSHIPS', desc: 'Sourced from expert home makers' },
                        { icon: <Clock className="text-[#f39200]" />, title: 'DAILY FRESH BATCHES', desc: 'Collected & delivered every day' },
                        { icon: <MapPin className="text-[#2d5a27]" />, title: 'DOORSTEP DELIVERY', desc: 'Convenience at your home' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center group">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-[#f39200]/10 transition-colors">{item.icon}</div>
                            <h4 className="font-black text-[9px] md:text-[10px] tracking-[0.2em] mb-1 md:mb-2">{item.title}</h4>
                            <p className="text-gray-400 text-[10px] md:text-xs italic">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Products Grid */}
            <section id="products" className="py-16 md:py-32 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 font-serif leading-tight italic">Freshly Made <span className="text-[#2d5a27]">& Delicious</span>.</h2>
                        <p className="text-gray-400 font-medium text-sm md:text-base italic">Pure, fresh, and ready for your perfect breakfast.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 justify-center">
                        {products.map(product => (
                            <motion.div key={product._id} whileHover={{ y: -8 }} className="bg-white rounded-[30px] md:rounded-[40px] overflow-hidden border border-gray-100 p-4 md:p-5 group shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                                <div className="relative h-56 md:h-72 w-full mb-6 md:mb-8 overflow-hidden rounded-[20px] md:rounded-[30px] shrink-0">
                                    <img src={product.image} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4 md:p-6 text-white">
                                        <div className="bg-white/90 backdrop-blur-md px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-lg md:text-xl text-[#2d5a27]">₹{product.price}</div>
                                    </div>
                                </div>
                                <div className="px-1 md:px-3 flex flex-col flex-1">
                                    <h3 className="text-2xl md:text-3xl font-black font-serif mb-2 md:mb-3 leading-none italic">{product.name}</h3>
                                    <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-10 leading-relaxed font-medium line-clamp-2 md:line-clamp-none flex-1">{product.description}</p>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-auto">
                                        <div className="flex items-center justify-center bg-gray-50 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 border border-gray-200 shadow-inner">
                                            <button onClick={() => updateLocalQty(product._id, -1)} className="p-1 hover:bg-white rounded-lg transition-colors text-gray-400"><Minus size={18} /></button>
                                            <span className="w-10 text-center font-black text-lg">{localQuantities[product._id] || 1}</span>
                                            <button onClick={() => updateLocalQty(product._id, 1)} className="p-1 hover:bg-white rounded-lg transition-colors text-gray-400"><Plus size={18} /></button>
                                        </div>
                                        <button onClick={() => addToCart(product)} className="flex-1 bg-[#2d5a27] text-white py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:scale-[0.98] transition-transform flex justify-center items-center gap-2 shadow-lg">ADD TO TRAY <ArrowRight size={14} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 md:py-32 bg-[#2d5a27] text-white px-4 md:px-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl lg:block hidden" />
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 md:gap-20 items-center">
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-6 md:mb-10 font-serif leading-tight italic">
                            The Taste <span className="text-[#f39200]">Of Home.</span>
                        </h2>
                        <div className="space-y-6 md:space-y-8 text-white/70 font-medium text-base md:text-lg leading-relaxed">
                            <p>Priya Traders brings you the warmth of a home-cooked meal. Our batter is prepared with care—pure, fresh, and absolutely delicious.</p>
                            <p>We've built a smart network to ensure you get this high-quality, fresh batter delivered directly to your doorstep every single day.</p>
                        </div>
                        <div className="mt-8 md:mt-12 flex flex-wrap justify-center lg:justify-start gap-6 md:gap-10">
                            <div><p className="text-2xl md:text-4xl font-black text-[#f39200]">50+</p><p className="text-[8px] md:text-xs font-bold uppercase tracking-widest opacity-50">Local Partners</p></div>
                            <div><p className="text-2xl md:text-4xl font-black text-[#f39200]">20+</p><p className="text-[8px] md:text-xs font-bold uppercase tracking-widest opacity-50">Areas Covered</p></div>
                            <div><p className="text-2xl md:text-4xl font-black text-[#f39200]">100%</p><p className="text-[8px] md:text-xs font-bold uppercase tracking-widest opacity-50">Pure Batter</p></div>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full max-w-xl"
                    >
                        <div className="relative group p-4 md:p-8">
                            <div className="absolute inset-0 bg-white/5 rounded-[40px] md:rounded-[80px] rotate-3 scale-95 group-hover:rotate-0 transition-transform duration-700 blur-sm" />
                            <img
                                src="https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=1200"
                                className="relative w-full aspect-square object-cover shadow-2xl rounded-[30px] md:rounded-[60px] ring-8 ring-white/5"
                                alt="Authentic South Indian Breakfast"
                            />
                            <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-white p-4 md:p-8 rounded-[30px] md:rounded-[50px] shadow-2xl hidden md:block">
                                <Leaf size={40} className="text-[#2d5a27] animate-bounce" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-20 md:pt-32 pb-12 md:pb-16 bg-white px-4 md:px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 mb-16 md:mb-20">
                    <div className="sm:col-span-2 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 md:mb-8">
                            {logo ? (
                                <img src={logo} alt="Priya Traders Logo" className="h-12 md:h-16 w-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
                            ) : null}
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic leading-none">
                                <span className="text-[#2d5a27]">PRIYA</span> <span className="text-[#f39200]">TRADERS</span>
                            </h2>
                        </div>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto sm:mx-0 leading-relaxed text-sm md:text-lg italic mb-8">Empowering local makers by bringing traditional, fresh, and pure batter directly to your home. Your daily breakfast, redefined.</p>
                        <div className="flex justify-center sm:justify-start gap-4 md:gap-6">
                            <a href="#" className="p-2.5 md:p-3 bg-gray-50 rounded-full text-gray-400 hover:text-[#f39200] hover:bg-orange-50 transition-colors"><Instagram size={18} /></a>
                            <a href="#" className="p-2.5 md:p-3 bg-gray-50 rounded-full text-gray-400 hover:text-[#f39200] hover:bg-orange-50 transition-colors"><Facebook size={18} /></a>
                            <a href="#" className="p-2.5 md:p-3 bg-gray-50 rounded-full text-gray-400 hover:text-[#f39200] hover:bg-orange-50 transition-colors"><Mail size={18} /></a>
                        </div>
                    </div>

                    <div className="text-center sm:text-left">
                        <h4 className="font-black text-[8px] md:text-[10px] tracking-[0.2em] uppercase mb-6 md:mb-8 text-gray-400">Navigation</h4>
                        <ul className="space-y-4 md:space-y-5 font-bold text-gray-800 uppercase text-[10px] md:text-xs tracking-widest">
                            <li><a href="#home" className="hover:text-[#2d5a27] transition-colors">Home</a></li>
                            <li><a href="#products" className="hover:text-[#2d5a27] transition-colors">Order Now</a></li>
                            <li><a href="#about" className="hover:text-[#2d5a27] transition-colors">Our Story</a></li>
                        </ul>
                    </div>

                    <div className="text-center sm:text-left">
                        <h4 className="font-black text-[8px] md:text-[10px] tracking-[0.2em] uppercase mb-6 md:mb-8 text-gray-400">Contact Us</h4>
                        <ul className="space-y-4 md:space-y-6">
                            <li className="flex gap-3 items-center justify-center sm:justify-start font-bold text-gray-800 italic text-sm md:text-base"><Phone size={16} className="text-[#f39200] shrink-0" /> +91 90597 57657</li>
                            <li className="flex gap-3 items-center justify-center sm:justify-start font-bold text-gray-800 italic text-sm md:text-base"><Mail size={16} className="text-[#f39200] shrink-0" /> orders@priyatraders.com</li>
                            <li className="flex gap-3 items-start justify-center sm:justify-start text-[10px] md:text-xs font-medium text-gray-400 italic leading-relaxed"><MapPin size={16} className="text-[#f39200] shrink-0 mt-0.5" /> Hyderabad Home Delivery</li>
                        </ul>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[110] bg-[#25D366] text-white p-3.5 md:p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 md:gap-3 font-bold"
            >
                <MessageCircle size={22} className="md:size-[32px]" />
                <span className="hidden sm:block text-xs md:text-base">Chat with us</span>
            </a>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white z-[160] shadow-2xl flex flex-col overflow-hidden">
                            <div className="p-6 md:p-10 bg-[#2d5a27] text-white flex justify-between items-center relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="relative">
                                    <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter">Your Tray</h2>
                                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50 italic">Confirm your details below</p>
                                </div>
                                <button onClick={() => setIsCartOpen(false)} className="text-white/60 hover:text-white transition-colors text-2xl md:text-3xl font-serif">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                                {cart.length === 0 ? (
                                    <div className="text-center py-16 flex flex-col items-center gap-4 md:gap-6 opacity-30">
                                        <ShoppingCart size={60} md:size={100} strokeWidth={1} className="text-gray-900" />
                                        <p className="font-bold text-[10px] md:text-xs tracking-widest uppercase">The tray is currently empty.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {/* Delivery Form */}
                                        <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100 space-y-4">
                                            <h4 className="font-black text-[10px] tracking-widest uppercase text-gray-400 mb-2">Delivery Details</h4>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Your Full Name"
                                                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm focus:ring-2 focus:ring-[#2d5a27] outline-none transition-all"
                                                    value={customerInfo.name}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm focus:ring-2 focus:ring-[#2d5a27] outline-none transition-all"
                                                    value={customerInfo.phone}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-6 text-gray-300" size={18} />
                                                <textarea
                                                    placeholder="Full Delivery Address (House No, Area, Landmark)"
                                                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm focus:ring-2 focus:ring-[#2d5a27] outline-none transition-all h-32 resize-none"
                                                    value={customerInfo.address}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div className="space-y-6">
                                            <h4 className="font-black text-[10px] tracking-widest uppercase text-gray-400">Order Summary</h4>
                                            {cart.map(item => (
                                                <div key={item._id} className="flex gap-4 md:gap-6 items-center group">
                                                    <img src={item.image} className="w-16 h-16 md:w-24 md:h-24 rounded-[15px] md:rounded-[30px] object-cover shadow-sm" alt={item.name} />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-black text-base md:text-xl mb-0.5 md:mb-1 font-serif italic truncate">{item.name}</h4>
                                                        <p className="text-[#2d5a27] font-black text-sm md:text-lg">₹{item.price * item.quantity}</p>
                                                        <div className="flex items-center gap-4 md:gap-6 mt-3 md:mt-4">
                                                            <div className="flex items-center bg-gray-50 rounded-lg md:rounded-xl px-2 py-1 gap-2 md:gap-4 border shadow-inner">
                                                                <button onClick={() => updateCartQty(item._id, -1)} className="text-gray-400 hover:text-black p-0.5"><Minus size={14} /></button>
                                                                <span className="text-xs md:text-sm font-black w-4 md:w-6 text-center">{item.quantity}</span>
                                                                <button onClick={() => updateCartQty(item._id, 1)} className="text-gray-400 hover:text-black p-0.5"><Plus size={14} /></button>
                                                            </div>
                                                            <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 transition-colors shrink-0"><Trash2 size={16} md:size={20} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-6 md:p-10 bg-gray-50 border-t border-gray-100 shrink-0">
                                    <div className="flex justify-between items-center mb-6 md:mb-10">
                                        <span className="text-gray-400 font-black text-[8px] md:text-[10px] uppercase tracking-widest italic">Total Amount</span>
                                        <span className="text-2xl md:text-4xl font-black text-gray-900 leading-none">₹{cartTotal}</span>
                                    </div>
                                    <button onClick={handlePlaceOrder} className="w-full bg-[#2d5a27] text-white py-4 md:py-6 rounded-xl md:rounded-[24px] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[0.98] transition-transform">PLACE ORDER</button>
                                    <p className="text-[7px] md:text-[9px] text-center text-gray-300 font-bold uppercase tracking-widest mt-6 md:mt-8 italic">We will call you on your number to confirm.</p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
