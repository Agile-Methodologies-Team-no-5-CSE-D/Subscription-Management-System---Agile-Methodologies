import React from 'react';

const AddressCard = ({ customer }) => {
    if (!customer) return null;

    return (
        <div className="text-sm">
            <h3 className="text-base font-bold text-[#111813] mb-4 pb-2 border-b border-[#f0f2f0]">Billing & Shipping Address</h3>

            <div className="space-y-1 text-[#61896b]">
                <p className="font-bold text-[#111813] text-sm">{customer.name}</p>
                <div className="leading-relaxed whitespace-pre-line">
                    {customer.address || 'No address provided'}
                </div>
                {customer.phone && <p>{customer.phone}</p>}
                <p className="pt-2 flex items-center gap-2 text-xs font-medium">
                    <span className="material-symbols-outlined text-[16px] opacity-70">mail</span>
                    {customer.email}
                </p>
            </div>
        </div>
    );
};

export default AddressCard;
