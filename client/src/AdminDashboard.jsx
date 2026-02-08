import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, RefreshCw, X, Calendar, DollarSign, Package, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = ({ onClose }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('Today'); // 'Today', 'Weekly', 'Monthly', 'All'
    const [stats, setStats] = useState({ count: 0, revenue: 0 });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (orders.length > 0) {
            filterData(period);
        }
    }, [orders, period]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/orders`);
            const allOrders = res.data.reverse(); // Newest first
            setOrders(allOrders);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const filterData = (selectedPeriod) => {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        let filtered = [];

        if (selectedPeriod === 'Today') {
            filtered = orders.filter(o => new Date(o.createdAt) >= startOfDay);
        } else if (selectedPeriod === 'Weekly') {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = orders.filter(o => new Date(o.createdAt) >= lastWeek);
        } else if (selectedPeriod === 'Monthly') {
            const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
            filtered = orders.filter(o => new Date(o.createdAt) >= lastMonth);
        } else {
            filtered = orders;
        }

        const rev = filtered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setStats({ count: filtered.length, revenue: rev });
        return filtered;
    };

    const downloadReport = () => {
        const filteredOrders = filterData(period);
        const doc = new jsPDF();

        // Header
        doc.setFillColor(45, 90, 39); // #2d5a27
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("PRIYA TRADERS - SALES REPORT", 105, 20, null, null, 'center');
        doc.setFontSize(12);
        doc.text(`${period} Report • Generated: ${new Date().toLocaleString()}`, 105, 30, null, null, 'center');

        // Summary Box
        doc.setFillColor(245, 245, 245);
        doc.rect(14, 50, 182, 30, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("Total Orders:", 20, 65);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`${stats.count}`, 20, 75);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Total Revenue:", 100, 65);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`Rs. ${stats.revenue}`, 100, 75);

        const tableData = filteredOrders.map(o => [
            new Date(o.createdAt).toLocaleDateString(),
            o.customerName,
            o.customerPhone,
            o.paymentMethod === 'online' ? `UPI (Ref: ${o.paymentRef || '-'})` : 'COD',
            `Rs. ${o.totalAmount}`,
            o.status || 'Pending'
        ]);

        autoTable(doc, {
            head: [['Date', 'Customer', 'Phone', 'Payment', 'Amount', 'Status']],
            body: tableData,
            startY: 90,
            theme: 'grid',
            headStyles: { fillColor: [45, 90, 39] },
        });

        doc.save(`PriyaTraders_${period}_Report.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-white z-[200] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#2d5a27] text-white p-6 sticky top-0 z-10 shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black italic">ADMIN DASHBOARD</h1>
                    <p className="text-xs font-bold opacity-70 tracking-widest uppercase">Manage Orders & Reports</p>
                </div>
                <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X /></button>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="relative w-full md:w-auto">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold text-gray-700 flex items-center justify-between w-full md:w-64 shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            <span>View: {period}</span>
                            <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl mt-2 overflow-hidden z-20">
                                {['Today', 'Weekly', 'Monthly', 'All'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setPeriod(p); setIsDropdownOpen(false); }}
                                        className="block w-full text-left px-6 py-3 hover:bg-gray-50 font-medium text-sm transition-colors"
                                    >
                                        {p} Orders
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button onClick={downloadReport} className="flex-1 md:flex-none bg-[#f39200] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg hover:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <Download size={18} /> Download Report
                        </button>
                        <button onClick={fetchOrders} className="bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 shadow-sm"><RefreshCw size={20} /></button>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-[#2d5a27] to-[#1e3c1a] p-8 rounded-[30px] text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2 opacity-80">
                                <Package size={20} />
                                <span className="text-xs font-bold uppercase tracking-widest">{period} Orders</span>
                            </div>
                            <h2 className="text-5xl font-black">{stats.count}</h2>
                            <p className="text-xs mt-2 opacity-60">
                                {period === 'Today' ? 'Since 12:00 AM' : `Total in this period`}
                            </p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
                    </div>

                    <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2 text-gray-400">
                                <DollarSign size={20} />
                                <span className="text-xs font-bold uppercase tracking-widest">{period} Revenue</span>
                            </div>
                            <h2 className="text-5xl font-black text-gray-900">₹{stats.revenue}</h2>
                            <p className="text-xs mt-2 text-gray-400">Total earnings</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-bold text-gray-700">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="p-4 md:p-6">Date</th>
                                    <th className="p-4 md:p-6">Customer</th>
                                    <th className="p-4 md:p-6">Ref ID</th>
                                    <th className="p-4 md:p-6">Amount</th>
                                    <th className="p-4 md:p-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-bold">Loading data...</td></tr>
                                ) : filterData(period).map(order => (
                                    <tr key={order._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 md:p-6 font-bold text-gray-700">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                            <div className="text-[10px] text-gray-400 font-normal">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4 md:p-6">
                                            <div className="font-bold text-gray-900">{order.customerName}</div>
                                            <div className="text-xs text-gray-500">{order.customerPhone}</div>
                                        </td>
                                        <td className="p-4 md:p-6 font-mono text-xs text-gray-600">
                                            {order.paymentRef || '-'}
                                        </td>
                                        <td className="p-4 md:p-6 font-black text-gray-900">₹{order.totalAmount}</td>
                                        <td className="p-4 md:p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.paymentMethod === 'online' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {order.paymentMethod === 'online' ? 'Online' : 'COD'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
