import React from 'react';

const SummaryBox = ({ invoice }) => {
    if (!invoice) return null;

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#dbe6de] shadow-sm">
            <h3 className="text-base font-bold text-[#111813] mb-6">Order Summary</h3>

            <div className="space-y-4 text-sm">
                <div className="border-t border-[#f0f2f0] my-2 pt-4">
                    <div className="flex justify-between text-lg font-black text-[#111813]">
                        <span>Total:</span>
                        <span className="text-[#2ecc71]">₹{invoice.amount}</span>
                    </div>
                </div>

                {invoice.paymentHistory && invoice.paymentHistory.map((pay, i) => (
                    <div key={i} className="bg-[#f8faf9] p-3 rounded-lg border border-[#dbe6de]/50 flex justify-between text-xs text-[#61896b]">
                        <span>Paid on {new Date(pay.date).toLocaleDateString()}:</span>
                        <span className="font-bold text-[#111813]">₹{pay.amount}</span>
                    </div>
                ))}

                <div className="pt-2">
                    <div className="flex justify-between text-base font-bold text-[#111813]">
                        <span>Amount Due:</span>
                        <span>{invoice.status === 'Paid' ? '₹0.00' : `₹${invoice.amount}`}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#f0f2f0]">
                <div className="flex items-center gap-2 text-xs text-[#61896b]">
                    <span className="material-symbols-outlined text-[16px] text-[#2ecc71]">verified_user</span>
                    <span className="font-bold text-[#111813]">Payment Term:</span> Immediate Payment
                </div>
            </div>
        </div>
    );
};

export default SummaryBox;
