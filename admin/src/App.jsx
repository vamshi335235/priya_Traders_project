import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    CheckCircle,
    Clock,
    Trash2,
    Phone,
    MapPin,
    RefreshCw,
    Search,
    Package,
    ArrowUpRight,
    MessageSquare,
    Truck,
    Box,
    ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_FLOW = [
    { id: 'Pending', label: 'Pending', icon: <Clock size={16} />, color: 'bg-amber-100 text-amber-600' },
    { id: 'Received', label: 'Order Received', icon: <ClipboardList size={16} />, color: 'bg-blue-100 text-blue-600' },
    { id: 'Packed', label: 'Order Packed', icon: <Box size={16} />, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'On The Way', label: 'Out for Delivery', icon: <Truck size={16} />, color: 'bg-purple-100 text-purple-600' },
    { id: 'Delivered', label: 'Delivered', icon: <CheckCircle size={16} />, color: 'bg-emerald-100 text-emerald-600' }
];

function App() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Auto refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`);
            setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setLoading(false);
        }
    };

    const updateStatus = async (id, status, customerPhone, customerName) => {
        try {
            await axios.patch(`${API_URL}/orders/${id}`, { status });
            fetchOrders();

            // Auto-notify customer via WhatsApp if status changed
            if (status !== 'Pending') {
                sendUpdateNotification(status, customerPhone, customerName);
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const sendUpdateNotification = (status, phone, name) => {
        let statusText = "";
        switch (status) {
            case 'Received': statusText = "✅ *Received* and is being processed!"; break;
            case 'Packed': statusText = "📦 *Packed* and ready for pickup!"; break;
            case 'On The Way': statusText = "🚀 *Out for Delivery* and will reach you soon!"; break;
            case 'Delivered': statusText = "✨ *Delivered* successfully! Enjoy your fresh batter."; break;
            default: return;
        }

        const message = `🍱 *Order Update from Priya Traders*%0A%0AHi *${name}*, your order is now ${statusText}%0A%0A🙏 Thank you for choosing Priya Traders!`;
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const deleteOrder = async (id) => {
        if (window.confirm('Delete this order permanently?')) {
            try {
                await axios.delete(`${API_URL}/orders/${id}`);
                fetchOrders();
            } catch (err) {
                console.error('Error deleting order:', err);
            }
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerPhone.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        processing: orders.filter(o => ['Received', 'Packed', 'On The Way'].includes(o.status)).length,
        revenue: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white min-h-screen p-6 hidden lg:block sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10 border-b border-slate-800 pb-10">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-xl italic text-slate-900">P</div>
                    <h1 className="text-xl font-black tracking-tighter">PRIYA <span className="text-emerald-400 font-normal underline decoration-2 underline-offset-4">ADMIN</span></h1>
                </div>

                <nav className="space-y-2">
                    <button className="flex items-center gap-3 w-full p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl font-bold text-sm transition-all border border-emerald-500/20">
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button className="flex items-center gap-3 w-full p-4 text-slate-400 hover:text-white rounded-2xl font-bold text-sm transition-all hover:bg-slate-800">
                        <Package size={20} /> Manage Stock
                    </button>
                </nav>

                <div className="absolute bottom-8 left-6 right-6">
                    <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/50">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">Live Monitoring</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                            <p className="text-xs font-bold text-emerald-400">System Connected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-hidden">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-1">Incoming Orders</h2>
                        <p className="text-slate-400 font-medium text-sm italic">Track and update orders to notify customers.</p>
                    </div>
                    <button onClick={fetchOrders} className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 shadow-sm active:scale-95">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Check for Orders
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Orders', value: stats.total, icon: <ShoppingBag className="text-blue-500" />, bg: 'bg-blue-50' },
                        { label: 'New Requests', value: stats.pending, icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50' },
                        { label: 'In-Progress', value: stats.processing, icon: <Box className="text-indigo-500" />, bg: 'bg-indigo-50' },
                        { label: 'Total Sales', value: `₹${stats.revenue}`, icon: <CheckCircle className="text-emerald-500" />, bg: 'bg-emerald-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-5">
                            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>{stat.icon}</div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm mb-8 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Search Customer Name or Phone Number..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl overflow-x-auto no-scrollbar">
                        {['All', ...STATUS_FLOW.map(s => s.id)].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === s ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {filteredOrders.length === 0 ? (
                            <div className="bg-white p-24 rounded-[40px] text-center border border-slate-100 flex flex-col items-center gap-4">
                                <Search size={48} className="text-slate-100" />
                                <p className="font-bold text-slate-300 italic uppercase tracking-widest text-xs">No matching orders found</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => {
                                const currentStatus = STATUS_FLOW.find(s => s.id === order.status) || STATUS_FLOW[0];
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={order._id}
                                        className="bg-white overflow-hidden rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group"
                                    >
                                        <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-10">
                                            {/* Customer Details */}
                                            <div className="lg:w-[30%]">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentStatus.color}`}>
                                                        {currentStatus.icon} {currentStatus.label}
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 mb-5 italic">{order.customerName}</h3>
                                                <div className="space-y-4">
                                                    <a href={`tel:${order.customerPhone}`} className="flex items-center gap-4 text-emerald-600 font-black text-sm bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 hover:bg-emerald-100 transition-all">
                                                        <Phone size={16} /> {order.customerPhone}
                                                    </a>
                                                    <div className="flex items-start gap-4 text-slate-400 font-medium text-xs leading-relaxed italic p-3">
                                                        <MapPin size={18} className="shrink-0 text-slate-300" />
                                                        {order.deliveryAddress}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items & Stats */}
                                            <div className="flex-1 bg-slate-50/50 rounded-[40px] p-6 lg:p-8 border border-slate-100/50">
                                                <div className="flex justify-between items-center mb-6 border-b border-slate-200/50 pb-4">
                                                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Customer Tray</h4>
                                                    <span className="text-[10px] font-bold text-slate-300">#{order._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <div className="space-y-4">
                                                    {order.items.map((item, id) => (
                                                        <div key={id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                                            <div className="flex items-center gap-4 text-sm font-bold text-slate-900">
                                                                <span className="bg-slate-900 text-white w-6 h-6 rounded-md flex items-center justify-center text-[10px]">{item.quantity}</span>
                                                                <span>{item.name}</span>
                                                            </div>
                                                            <span className="font-black text-sm text-emerald-600 tracking-tight">₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-8 flex justify-between items-end bg-white/50 p-5 rounded-3xl border border-white">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Total Bill</p>
                                                        <p className="text-3xl font-black text-slate-900 italic leading-none">₹{order.totalAmount}</p>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-300 italic opacity-50">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="lg:w-[25%] flex flex-col gap-3 justify-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center lg:text-left mb-2">Update Delivery Status</p>
                                                <div className="grid grid-cols-1 gap-2.5">
                                                    {STATUS_FLOW.map((s, idx) => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => updateStatus(order._id, s.id, order.customerPhone, order.customerName)}
                                                            disabled={order.status === s.id}
                                                            className={`w-full py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${order.status === s.id ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-500 hover:text-emerald-500 hover:shadow-xl active:scale-95'}`}
                                                        >
                                                            {s.icon} {s.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => deleteOrder(order._id)}
                                                    className="mt-4 text-rose-300 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors py-2"
                                                >
                                                    <Trash2 size={14} /> Remove Record
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default App;
