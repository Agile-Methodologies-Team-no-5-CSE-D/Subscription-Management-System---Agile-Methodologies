import React from 'react';

const RecurringPricesTable = ({ prices, onChange }) => {
    const handleAdd = () => {
        onChange([...prices, { period: 'Monthly', price: 0 }]);
    };

    const handleRemove = (idx) => {
        onChange(prices.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recurring Pricing</h3>
                <button
                    onClick={handleAdd}
                    className="text-sm text-primary hover:underline font-medium"
                >
                    Add Price
                </button>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-2">Period</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {prices.map((p, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2">
                                    <select
                                        value={p.period}
                                        onChange={(e) => {
                                            const newPrices = [...prices];
                                            newPrices[idx].period = e.target.value;
                                            onChange(newPrices);
                                        }}
                                        className="bg-transparent border-none focus:ring-0 w-full dark:text-white"
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <input
                                        type="number"
                                        value={p.price}
                                        onChange={(e) => {
                                            const newPrices = [...prices];
                                            newPrices[idx].price = parseFloat(e.target.value) || 0;
                                            onChange(newPrices);
                                        }}
                                        className="bg-transparent border-none focus:ring-0 w-full text-right dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => handleRemove(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {prices.length === 0 && (
                    <div className="p-4 text-center text-gray-400 italic">No recurring prices added.</div>
                )}
            </div>
        </div>
    );
};

export default RecurringPricesTable;
