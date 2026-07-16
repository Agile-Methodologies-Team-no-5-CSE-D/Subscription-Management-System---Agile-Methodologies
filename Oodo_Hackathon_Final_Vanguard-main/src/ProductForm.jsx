import React, { useState } from 'react';
import api from './api';
import RecurringPricesTable from './RecurringPricesTable';
import VariantsTable from './VariantsTable';

const ProductForm = ({ onSave, onDiscard }) => {
    const [activeTab, setActiveTab] = useState('recurring');
    const [formData, setFormData] = useState({
        productName: '',
        productType: 'service',
        tax: '',
        salesPrice: '',
        costPrice: '',
        recurringPrices: [],
        variants: []
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRecurringPricesChange = (newPrices) => {
        setFormData(prev => ({ ...prev, recurringPrices: newPrices }));
    };

    const handleVariantsChange = (newVariants) => {
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleSubmit = async () => {
        if (!formData.productName.trim()) {
            alert('Product Name must be filled');
            return;
        }

        const payload = {
            name: formData.productName,
            type: formData.productType,
            price: parseFloat(formData.salesPrice) || 0,
            cost: parseFloat(formData.costPrice) || 0,
            description: '', // Add description field if needed
            is_active: true
            // recurringPrices and variants are not yet supported by backend schema fully (simple schema), 
            // but we can just ignore them for now or store in description if JSON.
            // For now, only core fields.
        };

        try {
            const { data } = await api.post('/products', payload);
            if (onSave) {
                onSave(data);
            }
        } catch (error) {
            console.error('Failed to create product', error);
            alert('Failed to create product');
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-[#1a2e1f] p-4 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary-dark text-[#111813] font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={onDiscard}
                        className="bg-white dark:bg-transparent border border-[#dbe6de] dark:border-[#2a4531] text-[#61896b] hover:text-[#111813] font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                    >
                        Discard
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2e1f] rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531] p-8">
                {/* Main Fields */}
                <div className="space-y-6 mb-8">
                    {/* Product Name */}
                    <div>
                        <label htmlFor="productName" className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                            Product Name*
                        </label>
                        <input
                            type="text"
                            id="productName"
                            name="productName"
                            value={formData.productName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow text-lg font-bold"
                            placeholder="e.g. Premium Subscription"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Product Type */}
                        <div>
                            <label htmlFor="productType" className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Product Type
                            </label>
                            <select
                                id="productType"
                                name="productType"
                                value={formData.productType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                            >
                                <option value="service">Service</option>
                                <option value="consomable">Consumable</option>
                                <option value="storable">Storable Product</option>
                            </select>
                        </div>

                        {/* Sales Price */}
                        <div>
                            <label htmlFor="salesPrice" className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Sales Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    id="salesPrice"
                                    name="salesPrice"
                                    value={formData.salesPrice}
                                    onChange={handleInputChange}
                                    className="w-full pl-7 pr-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Cost Price */}
                        <div>
                            <label htmlFor="costPrice" className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Cost Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    id="costPrice"
                                    name="costPrice"
                                    value={formData.costPrice}
                                    onChange={handleInputChange}
                                    className="w-full pl-7 pr-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Tax */}
                        <div>
                            <label htmlFor="tax" className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Tax
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="tax"
                                    name="tax"
                                    value={formData.tax}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow text-right"
                                    placeholder="0%"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-[#dbe6de] dark:border-[#2a4531]">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('recurring')}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors capitalize
                ${activeTab === 'recurring'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-[#61896b] hover:text-[#111813] hover:border-gray-300'}
              `}
                        >
                            Recurring Prices
                        </button>
                        <button
                            onClick={() => setActiveTab('variants')}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors capitalize
                ${activeTab === 'variants'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-[#61896b] hover:text-[#111813] hover:border-gray-300'}
              `}
                        >
                            Variants
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'recurring' && (
                        <div className="animate-fade-in">
                            <RecurringPricesTable
                                prices={formData.recurringPrices}
                                onChange={handleRecurringPricesChange}
                            />
                        </div>
                    )}
                    {activeTab === 'variants' && (
                        <div className="animate-fade-in">
                            <VariantsTable
                                variants={formData.variants}
                                onChange={handleVariantsChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
