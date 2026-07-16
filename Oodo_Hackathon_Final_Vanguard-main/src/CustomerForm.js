import React, { useState } from 'react';
import api from './api';


const CustomerForm = ({ onSave, onDiscard }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', // Added password
        phone: '',
        address: '',
        city: '',
        status: 'Active'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            alert('Name, Email and Password are required');
            return;
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            company: '', // Optional
            address: `${formData.address}${formData.city ? ', ' + formData.city : ''}`
        };

        try {
            const { data } = await api.post('/auth/register', payload);
            if (onSave) {
                onSave(data); // data contains id, name, email
            }
        } catch (error) {
            console.error('Failed to create customer', error);
            alert(error.response?.data?.message || 'Failed to create customer');
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Customer Name*
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow font-bold"
                                placeholder="e.g. Wayne Enterprises"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Email Address*
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                                placeholder="contact@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Password*
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                                placeholder="********"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                                placeholder="+1 555-0000"
                            />
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                                placeholder="123 Business Way"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                                placeholder="Gotham City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111813] dark:text-[#e0e7e1] mb-1">
                                Initial Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-shadow"
                            >
                                <option value="Active">Active</option>
                                <option value="Prospect">Prospect</option>
                                <option value="Churned">Churned</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerForm;
