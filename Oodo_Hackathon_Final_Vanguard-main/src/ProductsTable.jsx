import React from 'react';

const ProductsTable = ({ products, onNew }) => {
    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white dark:bg-[#1a2e1f] p-4 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onNew}
                        className="bg-primary hover:bg-primary-dark text-[#111813] font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                    >
                        New Product
                    </button>
                </div>

                <div className="relative w-full sm:w-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61896b]">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-sm focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1a2e1f] rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#2a4531]/30 text-[#61896b] font-semibold border-b border-[#dbe6de] dark:border-[#2a4531]">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Sales Price</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbe6de] dark:divide-[#2a4531]">
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="group hover:bg-gray-50 dark:hover:bg-[#2a4531]/20 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-[#111813] dark:text-white">
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-4 text-[#111813] dark:text-[#e0e7e1]">
                                        {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price}
                                    </td>
                                    <td className="px-6 py-4 text-[#61896b] dark:text-[#a0cfa5]">
                                        {typeof product.cost === 'number' ? `$${product.cost.toFixed(2)}` : product.cost}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && (
                    <div className="p-8 text-center text-[#61896b]">No products found.</div>
                )}
            </div>
        </div>
    );
};

export default ProductsTable;
