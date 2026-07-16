import React, { useState } from 'react';

const InvoiceList = ({ initialInvoice, invoices, onStatusChange, onNew }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'detail'

    // Handle deep link from Subscription Manager
    React.useEffect(() => {
        if (initialInvoice) {
            setSelectedInvoice(initialInvoice);
            setView('detail');
        }
    }, [initialInvoice]);

    const filteredInvoices = (invoices || []).filter(invoice =>
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRowClick = (invoice) => {
        setSelectedInvoice(invoice);
        setView('detail');
    };

    const handleStatusUpdate = (id, newStatus) => {
        if (onStatusChange) {
            onStatusChange(id, newStatus);
        }
        setSelectedInvoice(prev => prev ? { ...prev, status: newStatus } : null);
    };

    const renderDetailView = () => {
        if (!selectedInvoice) return null;

        return (
            <div className="bg-white dark:bg-[#1a2e1f] rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531] overflow-hidden animate-fade-in">
                {/* Header/Actions */}
                <div className="p-6 border-b border-[#dbe6de] dark:border-[#2a4531] flex flex-wrap justify-between items-center gap-4 bg-gray-50/50 dark:bg-[#2a4531]/10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView('list')}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-[#111813] dark:text-white">{selectedInvoice.id}</h2>
                            <p className="text-sm text-[#61896b]">{selectedInvoice.customer}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedInvoice.status === 'Draft' && (
                            <>
                                <button
                                    onClick={() => handleStatusUpdate(selectedInvoice.id, 'Confirmed')}
                                    className="bg-primary hover:bg-primary-dark text-[#111813] font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedInvoice.id, 'Cancelled')}
                                    className="border border-red-200 text-red-600 hover:bg-red-50 py-2 px-6 rounded-lg font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        {selectedInvoice.status === 'Confirmed' && (
                            <>
                                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Confirmed
                                </div>
                                <button
                                    onClick={() => handleStatusUpdate(selectedInvoice.id, 'Paid')}
                                    className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                                >
                                    Mark as Paid
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedInvoice.id, 'Cancelled')}
                                    className="border border-red-200 text-red-600 hover:bg-red-50 py-2 px-6 rounded-lg font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        {selectedInvoice.status === 'Cancelled' && (
                            <>
                                <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    Cancelled
                                </div>
                                <button
                                    onClick={() => handleStatusUpdate(selectedInvoice.id, 'Draft')}
                                    className="border border-primary text-primary hover:bg-primary/5 py-2 px-6 rounded-lg font-bold transition-colors"
                                >
                                    Reset to Draft
                                </button>
                            </>
                        )}

                        {/* Standard statuses (Paid, etc) */}
                        {!['Draft', 'Confirmed', 'Cancelled'].includes(selectedInvoice.status) && (
                            <span className={`px-4 py-2 rounded-lg font-bold text-sm ${selectedInvoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {selectedInvoice.status}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-[#61896b] uppercase tracking-wider">Customer</label>
                                <p className="text-lg font-semibold text-[#111813] dark:text-white">{selectedInvoice.customer}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[#61896b] uppercase tracking-wider">Subscription Reference</label>
                                <p className="text-[#111813] dark:text-white">{selectedInvoice.subscription}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between border-b border-[#dbe6de] dark:border-[#2a4531] pb-2">
                                <label className="text-sm text-[#61896b]">Invoice Date</label>
                                <p className="text-sm font-medium dark:text-white">{selectedInvoice.date}</p>
                            </div>
                            <div className="flex justify-between border-b border-[#dbe6de] dark:border-[#2a4531] pb-2">
                                <label className="text-sm text-[#61896b]">Due Date</label>
                                <p className="text-sm font-medium dark:text-white">{selectedInvoice.dueDate}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <label className="text-lg font-bold text-[#111813] dark:text-white">Amount Due</label>
                                <p className="text-2xl font-black text-primary">{selectedInvoice.amount}</p>
                            </div>
                        </div>
                    </div>

                    {selectedInvoice.paymentHistory && selectedInvoice.paymentHistory.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-[#111813] dark:text-white mb-4">Payment Transactions</h3>
                            <div className="border border-[#dbe6de] dark:border-[#2a4531] rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-[#2a4531]/30 text-[#61896b] font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-left">Method</th>
                                            <th className="px-4 py-3 text-left">Reference</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#dbe6de] dark:divide-[#2a4531]">
                                        {selectedInvoice.paymentHistory.map((payment, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 dark:text-white">{payment.date}</td>
                                                <td className="px-4 py-3 text-[#61896b]">{payment.method}</td>
                                                <td className="px-4 py-3 font-medium text-primary">{payment.reference}</td>
                                                <td className="px-4 py-3 text-right font-bold dark:text-white">{payment.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderListView = () => (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white dark:bg-[#1a2e1f] p-4 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onNew}
                        className="bg-primary hover:bg-primary-dark text-[#111813] font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                    >
                        New Invoice
                    </button>
                </div>

                <div className="relative w-full sm:w-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61896b]">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-sm focus:ring-primary focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1a2e1f] rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#2a4531]/30 text-[#61896b] font-semibold border-b border-[#dbe6de] dark:border-[#2a4531]">
                            <tr>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Subscription</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbe6de] dark:divide-[#2a4531]">
                            {filteredInvoices.map((invoice) => (
                                <tr
                                    key={invoice.id}
                                    className="hover:bg-gray-50 dark:hover:bg-[#2a4531]/20 cursor-pointer transition-colors"
                                    onClick={() => handleRowClick(invoice)}
                                >
                                    <td className="px-6 py-4 font-medium text-primary hover:underline">{invoice.id}</td>
                                    <td className="px-6 py-4 text-[#111813] dark:text-[#e0e7e1]">{invoice.customer}</td>
                                    <td className="px-6 py-4 text-[#61896b] dark:text-[#a0cfa5]">{invoice.subscription}</td>
                                    <td className="px-6 py-4 text-[#61896b] dark:text-[#a0cfa5]">{invoice.date}</td>
                                    <td className="px-6 py-4 text-[#61896b] dark:text-[#a0cfa5]">{invoice.dueDate}</td>
                                    <td className="px-6 py-4 font-medium text-[#111813] dark:text-white">{invoice.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                            invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                                invoice.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                                                    invoice.status === 'Cancelled' ? 'bg-red-50 text-red-500' :
                                                        invoice.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
                                                            'bg-gray-100 text-gray-700'
                                            }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredInvoices.length === 0 && (
                    <div className="p-8 text-center text-[#61896b]">No invoices found.</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {view === 'list' ? renderListView() : renderDetailView()}
        </div>
    );
};

export default InvoiceList;
