import React from 'react';

const InvoiceTable = ({ lines = [] }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#dbe6de] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[11px] uppercase bg-[#f8faf9] text-[#61896b] font-black border-b border-[#dbe6de] tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4 text-right">Quantity</th>
                            <th className="px-6 py-4 text-right">Unit Price</th>
                            <th className="px-6 py-4 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f0]">
                        {lines.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-5 text-center">No items</td></tr>
                        ) : (
                            lines.map((line, index) => (
                                <tr key={index} className="hover:bg-[#f8faf9]/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-[#111813]">{line.product}</div>
                                    </td>
                                    <td className="px-6 py-5 text-right font-medium text-[#111813]">
                                        {line.quantity} Units
                                    </td>
                                    <td className="px-6 py-5 text-right font-medium text-[#111813]">
                                        ₹{line.price}
                                    </td>
                                    <td className="px-6 py-5 text-right font-bold text-[#111813]">
                                        ₹{line.subtotal}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceTable;
