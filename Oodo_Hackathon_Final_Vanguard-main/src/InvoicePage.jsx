import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalHeader from './components/PortalHeader';
import AddressCard from './components/AddressCard';
import InvoiceTable from './components/InvoiceTable';
import SummaryBox from './components/SummaryBox';
import api from './api';

const InvoicePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const themeColor = '#2ecc71';

    useEffect(() => {
        const fetchInvoice = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const { data } = await api.get(`/invoices/${id}`);
                setInvoice(data);
            } catch (error) {
                console.error("Failed to fetch invoice", error);
                // alert("Failed to fetch invoice");
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePay = async () => {
        try {
            await api.post(`/invoices/${id}/pay`);
            alert('Payment successful!');
            window.location.reload();
        } catch (error) {
            console.error("Failed to pay invoice", error);
            alert("Failed to pay invoice");
        }
    };

    if (!invoice) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="bg-[#525659] min-h-screen font-['Inter'] py-12">
            <PortalHeader themeColor={themeColor} />

            {/* Actions Bar */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center text-white">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:opacity-80">
                    <span className="material-symbols-outlined">arrow_back</span> Back
                </button>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                        <span className="material-symbols-outlined text-[18px]">print</span> Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                        <span className="material-symbols-outlined text-[18px]">download</span> Download
                    </button>
                    {invoice.status !== 'Paid' && (
                        <button
                            onClick={handlePay}
                            className="flex items-center gap-2 px-6 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded-lg text-sm font-bold shadow-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">credit_card</span>
                            Pay Now
                        </button>
                    )}
                </div>
            </div>

            {/* A4 Paper Document */}
            <main className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl p-[15mm] text-[#111813] relative">
                {/* Status Stamp */}
                {invoice.status === 'Paid' && (
                    <div className="absolute top-12 right-12 border-4 border-[#2ecc71] text-[#2ecc71] px-6 py-2 text-3xl font-black uppercase opacity-20 transform -rotate-12 select-none pointer-events-none">
                        PAID
                    </div>
                )}

                {/* Header */}
                <header className="flex justify-between items-start mb-16 border-b border-gray-100 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#111813] rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
                            <span className="text-xl font-bold tracking-tight">SaaS Global</span>
                        </div>
                        <div className="text-sm text-gray-500 leading-relaxed">
                            <p>456 Enterprise Boulevard</p>
                            <p>Tech District, NY 10001</p>
                            <p>United States</p>
                            <p className="mt-2">support@saasglobal.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-light text-gray-900 tracking-wide mb-2">INVOICE</h1>
                        <p className="text-gray-500 font-medium">#{invoice.id}</p>
                    </div>
                </header>

                {/* Info Grid */}
                <div className="flex justify-between mb-16">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Bill To</h3>
                        <div className="text-sm font-medium">
                            <p className="text-lg font-bold text-gray-900 mb-1">{invoice.customer.name}</p>
                            <p className="text-gray-600">{invoice.customer.email}</p>
                            <p className="text-gray-600 whitespace-pre-line">{invoice.customer.address || 'No address provided'}</p>
                            <p className="text-gray-600">{invoice.customer.phone}</p>
                        </div>
                    </div>
                    <div className="space-y-2 text-right">
                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</h3>
                            <p className="text-sm font-semibold text-gray-900">{invoice.date}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Due Date</h3>
                            <p className="text-sm font-semibold text-gray-900">{invoice.dueDate}</p>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-12">
                    <table className="w-full">
                        <thead className="border-b-2 border-gray-900">
                            <tr>
                                <th className="text-left py-3 text-xs font-bold text-gray-900 uppercase tracking-wider">Description</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-900 uppercase tracking-wider">Qty</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-900 uppercase tracking-wider">Unit Price</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-900 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoice.lines && invoice.lines.map((line, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 text-sm font-medium text-gray-900">{line.product}</td>
                                    <td className="py-4 text-sm text-gray-600 text-right">{line.quantity}</td>
                                    <td className="py-4 text-sm text-gray-600 text-right">${typeof line.price === 'number' ? line.price.toFixed(2) : line.price}</td>
                                    <td className="py-4 text-sm font-bold text-gray-900 text-right">${typeof line.subtotal === 'number' ? line.subtotal.toFixed(2) : line.subtotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end mb-24">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-900">${(Number(invoice.amount)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax (0%)</span>
                            <span className="font-medium text-gray-900">$0.00</span>
                        </div>
                        <div className="flex justify-between text-lg font-black pt-4 border-t-2 border-gray-900 mt-4">
                            <span>Total</span>
                            <span>${(Number(invoice.amount)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <footer className="border-t border-gray-100 pt-8 text-sm text-gray-500">
                    <h4 className="font-bold text-gray-900 mb-2">Terms & Notes</h4>
                    <p>Payment is due within 15 days. Please include the invoice number on your check.</p>
                    <p className="mt-2">Thank you for your business!</p>
                </footer>
            </main>
        </div>
    );
};

export default InvoicePage;
