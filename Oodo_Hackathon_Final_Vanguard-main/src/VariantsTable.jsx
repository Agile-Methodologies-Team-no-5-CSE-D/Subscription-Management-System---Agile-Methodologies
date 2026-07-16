import React from 'react';

const VariantsTable = ({ variants, onChange }) => {
    const handleAdd = () => {
        onChange([...variants, { attribute: 'Color', value: 'White' }]);
    };

    const handleRemove = (idx) => {
        onChange(variants.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Product Variants</h3>
                <button
                    onClick={handleAdd}
                    className="text-sm text-primary hover:underline font-medium"
                >
                    Add Variant
                </button>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-2">Attribute</th>
                            <th className="px-4 py-2">Value</th>
                            <th className="px-4 py-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {variants.map((v, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={v.attribute}
                                        onChange={(e) => {
                                            const newVars = [...variants];
                                            newVars[idx].attribute = e.target.value;
                                            onChange(newVars);
                                        }}
                                        className="bg-transparent border-none focus:ring-0 w-full dark:text-white"
                                        placeholder="e.g. Size"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={v.value}
                                        onChange={(e) => {
                                            const newVars = [...variants];
                                            newVars[idx].value = e.target.value;
                                            onChange(newVars);
                                        }}
                                        className="bg-transparent border-none focus:ring-0 w-full dark:text-white"
                                        placeholder="e.g. Large"
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
                {variants.length === 0 && (
                    <div className="p-4 text-center text-gray-400 italic">No variants added.</div>
                )}
            </div>
        </div>
    );
};

export default VariantsTable;
