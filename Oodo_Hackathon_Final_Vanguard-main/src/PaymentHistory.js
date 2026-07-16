import React, { useState } from 'react';

// Mock Payment History Data
const mockPayments = [
    { id: 'PAY/2026/001', date: 'Jan 15, 2026', customer: 'Acme Corp', invoice: 'INV/2026/001', method: 'Credit Card', amount: '$140.00', status: 'Completed' },
    { id: 'PAY/2025/128', date: 'Dec 16, 2025', customer: 'Acme Corp', invoice: 'INV/2025/128', method: 'Bank Transfer', amount: '$140.00', status: 'Completed' },
    { id: 'PAY/2025/142', date: 'Dec 20, 2025', customer: 'Globex Inc', invoice: 'INV/2025/142', method: 'Credit Card', amount: '$116.00', status: 'Completed' },
    { id: 'PAY/2025/055', date: 'Apr 15, 2025', customer: 'Umbrella Corp', invoice: 'INV/2025/055', method: 'Wire Transfer', amount: '$5,000.00', status: 'Completed' },
    { id: 'PAY/2026/005', date: 'Jan 18, 2026', customer: 'Globex Inc', invoice: 'INV/2026/005', method: 'Credit Card', amount: '$116.00', status: 'Failed' }
];

const PaymentHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPayments = mockPayments.filter(payment =>
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white dark:bg-[#1a2e1f] p-4 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-[#111813] dark:text-white">Payment History</h3>
                </div>

                <div className="relative w-full sm:w-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61896b]">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input
                        type="text"
                        placeholder="Search payments..."
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
                                <th className="px-6 py-4">Payment #</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbe6de] dark:divide-[#2a4531]">
                            {filteredPayments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-gray-50 dark:hover:bg-[#2a4531]/20 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-primary">{payment.id}</td>
                                    <td className="px-6 py-4 text-[#61896b] dark:text-[#a0cfa5]">{payment.date}</td>
                                    <td className="px-6 py-4 text-[#111813] dark:text-[#e0e7e1]">{payment.customer}</td>
                                    <td className="px-6 py-4 text-primary hover:underline cursor-pointer">{payment.invoice}</td>
                                    <td className="px-6 py-4 text-[#61896b] dark:text-[#a0cfa5]">{payment.method}</td>
                                    <td className="px-6 py-4 font-medium text-[#111813] dark:text-white">{payment.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${payment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPayments.length === 0 && (
                    <div className="p-8 text-center text-[#61896b]">No payments found.</div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
