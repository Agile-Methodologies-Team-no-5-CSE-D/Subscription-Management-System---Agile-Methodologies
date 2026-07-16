import React, { useState } from 'react';
import api from './api';

const RecurringPlans = ['Monthly', 'Yearly', 'Weekly'];
const PaymentTerms = ['Immediate Payment', '15 Days', '30 Days', 'End of Following Month'];

const SubscriptionManager = ({ onNavigate, subscriptions, setSubscriptions, invoices, setInvoices, userRole, products, customers }) => {
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFormTab, setActiveFormTab] = useState('orderLines');
    const [statusMessage, setStatusMessage] = useState('');

    // Update status message whenever subscription status changes
    React.useEffect(() => {
        if (currentSubscription) {
            setStatusMessage(currentSubscription.status);
        }
    }, [currentSubscription?.status]);

    // --- Actions ---

    const handleNewClick = () => {
        setCurrentSubscription({
            id: 'New',
            customer: '',
            nextInvoice: '',
            recurring: '',
            plan: 'Monthly',
            status: 'Quotation',
            template: 'Default Subscription',
            expiration: '',
            paymentTerm: 'Immediate Payment',
            salesPerson: 'Mitchell Admin',
            startDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Credit Card',
            paymentDone: false,
            orderLines: [{ product: 'Demo Product', quantity: 1, unitPrice: 10, discount: 0, taxes: 0, subtotal: 10 }],
            history: []
        });
        setActiveFormTab('orderLines');
        setView('form');
    };

    const handleRowClick = (sub) => {
        setCurrentSubscription({ ...sub });
        setActiveFormTab('orderLines');
        setView('form');
    };

    const handleDelete = async () => {
        if (currentSubscription && currentSubscription.id !== 'New') {
            if (!window.confirm('Are you sure you want to delete this subscription?')) return;
            try {
                await api.delete(`/subscriptions/${currentSubscription.id}`);
                setSubscriptions(subscriptions.filter(s => s.id !== currentSubscription.id));
                setView('list');
            } catch (error) {
                console.error('Failed to delete subscription', error);
                alert('Failed to delete subscription');
            }
        } else {
            setView('list');
        }
    };

    const validateForm = () => {
        // Validation: Ensure mandatory fields are filled
        if (!currentSubscription.customer?.trim()) {
            alert('the field must be filled');
            return false;
        }
        if (!currentSubscription.startDate) {
            alert('the field must be filled');
            return false;
        }
        if (!currentSubscription.salesPerson?.trim()) {
            alert('the field must be filled');
            return false;
        }
        if (!currentSubscription.plan) {
            alert('the field must be filled');
            return false;
        }
        if (!currentSubscription.orderLines || currentSubscription.orderLines.length === 0) {
            alert('the field must be filled');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const recurringAmount = currentSubscription.orderLines.reduce((acc, line) => acc + parseFloat(line.subtotal || 0), 0);

        // Prepare payload for backend
        const payload = {
            customer_id: customers.find(c => c.name === currentSubscription.customer)?.id || 1, // Fallback to 1 (Admin) if not found/new
            plan: currentSubscription.plan,
            start_date: currentSubscription.startDate,
            payment_term: currentSubscription.paymentTerm || 'Immediate Payment',
            sales_person: currentSubscription.salesPerson,
            orderLines: currentSubscription.orderLines.map(line => ({
                product: line.product,
                productId: line.productId || products.find(p => p.name === line.product)?.id, // Try to find ID
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                subtotal: line.subtotal
            }))
        };

        try {
            if (currentSubscription.id === 'New') {
                const { data } = await api.post('/subscriptions', payload);
                // Ideally refresh from backend, but optimistic update for speed
                const newSub = {
                    ...currentSubscription,
                    id: `S${String(data.id).padStart(4, '0')}`,
                    recurring: `$${recurringAmount.toFixed(2)}`,
                    status: 'Quotation'
                };
                setSubscriptions([newSub, ...subscriptions]);
            } else {
                await api.put(`/subscriptions/${currentSubscription.id}`, payload);
                const updatedSub = {
                    ...currentSubscription,
                    recurring: `$${recurringAmount.toFixed(2)}`
                };
                setSubscriptions(subscriptions.map(s => s.id === currentSubscription.id ? updatedSub : s));
            }
            setView('list');
        } catch (error) {
            console.error('Failed to save subscription', error);
            alert('Failed to save subscription');
        }
    };

    const handleStatusUpdate = async (status) => {
        if (!currentSubscription || currentSubscription.id === 'New') return;
        try {
            await api.patch(`/subscriptions/${currentSubscription.id}/status`, { status });
            const updatedSub = { ...currentSubscription, status };
            setCurrentSubscription(updatedSub);
            setSubscriptions(subscriptions.map(s => s.id === currentSubscription.id ? updatedSub : s));
        } catch (error) {
            console.error(`Failed to update status to ${status}`, error);
            alert(`Failed to update status`);
        }
    };

    const handleSend = () => {
        if (!validateForm()) return;
        handleStatusUpdate('Quotation Sent');
    };

    const handleConfirm = () => {
        if (!validateForm()) return;
        handleStatusUpdate('Confirmed');
    };

    const handleRenew = () => {
        const today = new Date();
        const nextInvoiceDate = new Date();
        if (currentSubscription.plan === 'Monthly') {
            nextInvoiceDate.setMonth(today.getMonth() + 1);
        } else if (currentSubscription.plan === 'Yearly') {
            nextInvoiceDate.setFullYear(today.getFullYear() + 1);
        } else {
            nextInvoiceDate.setDate(today.getDate() + 7);
        }

        const newSub = {
            ...currentSubscription,
            id: 'New',
            status: 'Quotation',
            startDate: today.toISOString().split('T')[0],
            nextInvoice: nextInvoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            history: []
        };
        setCurrentSubscription(newSub);
        setActiveFormTab('orderLines');
        setView('form');
    };

    const handleCreateInvoice = () => {
        const newInvoiceRes = {
            id: `INV/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`,
            customer: currentSubscription.customer,
            subscription: currentSubscription.id,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            dueDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: currentSubscription.recurring,
            status: 'Draft',
            paymentHistory: []
        };

        // Update Invoices list in parent
        setInvoices([...invoices, newInvoiceRes]);

        const updatedSub = {
            ...currentSubscription,
            history: [{
                date: newInvoiceRes.date,
                type: 'Invoice',
                reference: newInvoiceRes.id,
                amount: newInvoiceRes.amount,
                status: 'Draft'
            }, ...(currentSubscription.history || [])]
        };
        setCurrentSubscription(updatedSub);
        setSubscriptions(subscriptions.map(s => s.id === currentSubscription.id ? updatedSub : s));

        if (onNavigate) {
            onNavigate('invoices', newInvoiceRes);
        }
    };

    const handleUpsell = () => {
        const newUpsell = {
            ...currentSubscription,
            id: 'New',
            status: 'Quotation',
            startDate: new Date().toISOString().split('T')[0],
            history: [],
            customer: `${currentSubscription.customer} (Upsell)`
        };
        setCurrentSubscription(newUpsell);
        setActiveFormTab('orderLines');
        setView('form');
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this subscription?')) {
            handleStatusUpdate('Churned'); // Or Cancelled
        }
    };

    const handleClose = () => {
        handleStatusUpdate('Closed');
        setView('list');
    };

    // --- Sub-Components ---

    const StatusIndicator = ({ message }) => {
        if (!message) return null;

        return (
            <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-bold shadow-sm animate-fade-in text-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Status: {message}
            </div>
        );
    };

    // --- Views ---

    const renderListView = () => {
        const filteredSubs = (subscriptions || []).filter(sub =>
            sub.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white dark:bg-[#1a2e1f] p-4 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                    <div className="flex items-center gap-2">
                        {userRole !== 'internal' && (
                            <button onClick={handleNewClick} className="bg-primary hover:bg-primary-dark text-[#111813] font-bold py-2 px-6 rounded-lg shadow-sm transition-colors">New</button>
                        )}
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61896b]"><span className="material-symbols-outlined text-[20px]">search</span></span>
                        <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] text-sm focus:ring-primary focus:border-primary" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a2e1f] rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#2a4531]/30 text-[#61896b] font-semibold border-b border-[#dbe6de] dark:border-[#2a4531]">
                                <tr>
                                    <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded text-primary focus:ring-primary border-gray-300" /></th>
                                    <th className="px-6 py-4">Number</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Next Invoice</th>
                                    <th className="px-6 py-4">Recurring</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#dbe6de] dark:divide-[#2a4531]">
                                {filteredSubs.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-[#2a4531]/20 cursor-pointer transition-colors" onClick={() => handleRowClick(sub)}>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded text-primary focus:ring-primary border-gray-300" /></td>
                                        <td className="px-6 py-4 font-medium text-[#111813] dark:text-white">{sub.id}</td>
                                        <td className="px-6 py-4 text-[#111813] dark:text-[#e0e7e1]">{sub.customer}</td>
                                        <td className="px-6 py-4 text-[#61896b] dark:text-[#a0cfa5]">{sub.nextInvoice}</td>
                                        <td className="px-6 py-4 font-medium text-[#111813] dark:text-white">{sub.recurring}</td>
                                        <td className="px-6 py-4 text-[#61896b] dark:text-[#a0cfa5]">{sub.plan}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.status === 'Confirmed' ? 'bg-green-100 text-green-700' : sub.status === 'Churned' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{sub.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderFormView = () => {
        return (
            <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-[#1a2e1f] p-4 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                    <div className="flex items-center gap-2 flex-wrap">
                        {userRole !== 'internal' && (
                            <>
                                <button onClick={handleNewClick} className="bg-primary hover:bg-primary-dark text-[#111813] font-bold py-2 px-6 rounded-lg shadow-sm transition-colors">New</button>
                                <div className="flex gap-2 ml-2">
                                    <button onClick={handleDelete} className="p-2 text-[#61896b] hover:text-red-500 transition-colors border border-[#dbe6de] dark:border-[#2a4531] rounded-lg" title="Delete"><span className="material-symbols-outlined">delete</span></button>
                                    <button onClick={handleSave} className="p-2 text-[#61896b] hover:text-primary transition-colors border border-[#dbe6de] dark:border-[#2a4531] rounded-lg" title="Save"><span className="material-symbols-outlined">save</span></button>
                                </div>
                                <div className="h-6 w-px bg-gray-300 dark:bg-[#2a4531] mx-2"></div>

                                {currentSubscription.status === 'Quotation' && (
                                    <>
                                        <button onClick={handleSend} className="px-6 py-2 rounded-lg font-bold text-[#111813] bg-primary hover:bg-primary-dark transition-colors">Send</button>
                                        <button onClick={handleConfirm} className="px-6 py-2 rounded-lg font-bold text-[#61896b] border border-[#dbe6de] dark:border-[#2a4531] hover:bg-gray-50 bg-white dark:bg-transparent transition-colors">Confirm</button>
                                    </>
                                )}
                                {currentSubscription.status === 'Quotation Sent' && (
                                    <>
                                        <button className="px-6 py-2 rounded-lg font-bold text-[#61896b] border border-[#dbe6de] dark:border-[#2a4531] hover:bg-gray-50 bg-white dark:bg-transparent transition-colors">Preview</button>
                                        <button onClick={handleConfirm} className="px-6 py-2 rounded-lg font-bold text-[#111813] bg-primary hover:bg-primary-dark transition-colors">Confirm</button>
                                    </>
                                )}
                                {currentSubscription.status === 'Confirmed' && (
                                    <div className="flex gap-2 flex-wrap">
                                        <button onClick={handleCreateInvoice} className="px-4 py-2 rounded-lg font-bold text-[#111813] bg-primary hover:bg-primary-dark transition-colors">Create Invoice</button>
                                        <button onClick={handleRenew} className="px-4 py-2 rounded-lg font-bold text-[#61896b] border border-[#dbe6de] dark:border-[#2a4531] hover:bg-gray-50 bg-white dark:bg-transparent transition-colors">Renew</button>
                                        <button onClick={handleUpsell} className="px-4 py-2 rounded-lg font-bold text-[#61896b] border border-[#dbe6de] dark:border-[#2a4531] hover:bg-gray-50 bg-white dark:bg-transparent transition-colors">Upsell</button>
                                        <button onClick={handleCancel} className="px-4 py-2 rounded-lg font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">Cancel</button>
                                        <button onClick={handleClose} className="px-4 py-2 rounded-lg font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Close</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <StatusIndicator message={statusMessage} />
                </div>

                {currentSubscription.status === 'Quotation Sent' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center gap-4 animate-fade-in">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600"><span className="material-symbols-outlined">mail_outline</span></div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Quotation Sent to Client</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Recipient: <span className="font-bold">{currentSubscription.customer}</span> · Sent by: <span className="font-bold">{currentSubscription.salesPerson}</span></p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-[#1a2e1f] rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531] p-8">
                    <div className="flex justify-between items-start mb-8"><h1 className="text-3xl font-bold text-[#111813] dark:text-white">{currentSubscription.id === 'New' ? 'New Subscription' : currentSubscription.id}</h1></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1"><label className="text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Customer*</label><input type="text" className="form-input rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={currentSubscription.customer} onChange={(e) => setCurrentSubscription({ ...currentSubscription, customer: e.target.value })} placeholder="Enter customer name" /></div>
                            <div className="flex flex-col gap-1"><label className="text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Quotation Template</label><select className="form-select rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={currentSubscription.template} onChange={(e) => setCurrentSubscription({ ...currentSubscription, template: e.target.value })}><option>Default Subscription</option><option>Premium Plan</option></select></div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1"><label className="text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Expiration</label><input type="date" className="form-input rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={currentSubscription.expiration} onChange={(e) => setCurrentSubscription({ ...currentSubscription, expiration: e.target.value })} /></div>
                            <div className="flex flex-col gap-1"><label className="text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Recurring Plan*</label><select className="form-select rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={currentSubscription.plan} onChange={(e) => setCurrentSubscription({ ...currentSubscription, plan: e.target.value })}>{RecurringPlans.map(p => <option key={p}>{p}</option>)}</select></div>
                            <div className="flex flex-col gap-1"><label className="text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Payment Terms</label><select className="form-select rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={currentSubscription.paymentTerm} onChange={(e) => setCurrentSubscription({ ...currentSubscription, paymentTerm: e.target.value })}>{PaymentTerms.map(t => <option key={t}>{t}</option>)}</select></div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex border-b border-[#dbe6de] dark:border-[#2a4531] mb-6 gap-6">
                            {['orderLines', 'otherInfo', 'history'].map(tab => (
                                <button key={tab} onClick={() => setActiveFormTab(tab)} className={`px-2 py-3 font-semibold transition-colors border-b-2 capitalize ${activeFormTab === tab ? 'text-primary border-primary' : 'text-[#61896b] border-transparent hover:text-[#111813]'}`}>{tab === 'orderLines' ? 'Order Lines' : tab === 'otherInfo' ? 'Other info' : 'Invoices & History'}</button>
                            ))}
                        </div>

                        {activeFormTab === 'orderLines' && (
                            <div className="animate-fade-in">
                                <div className="overflow-x-auto border border-[#dbe6de] dark:border-[#2a4531] rounded-lg mb-8">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-[#2a4531]/30 text-[#61896b] font-semibold border-b border-[#dbe6de] dark:border-[#2a4531]">
                                            <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3 w-32">Quantity</th><th className="px-4 py-3">Unit Price</th><th className="px-4 py-3 w-32">Discount (%)</th><th className="px-4 py-3">Taxes</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 w-10"></th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#dbe6de] dark:divide-[#2a4531]">
                                            {currentSubscription.orderLines.map((line, idx) => (
                                                <tr key={idx} className="bg-white dark:bg-[#1a2e1f]">
                                                    <td className="px-4 py-3">
                                                        <select
                                                            className="w-full rounded border border-[#dbe6de] dark:border-[#3a5840] bg-transparent px-2 py-1 text-sm focus:ring-primary focus:border-primary"
                                                            value={line.productId || ''}
                                                            onChange={(e) => {
                                                                const prodId = parseInt(e.target.value);
                                                                const prod = products.find(p => p.id === prodId);
                                                                if (prod) {
                                                                    const newLines = [...currentSubscription.orderLines];
                                                                    newLines[idx].product = prod.name;
                                                                    newLines[idx].productId = prod.id;
                                                                    newLines[idx].unitPrice = prod.price;
                                                                    newLines[idx].quantity = 1;
                                                                    newLines[idx].subtotal = prod.price;
                                                                    setCurrentSubscription({ ...currentSubscription, orderLines: newLines });
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Select Product</option>
                                                            {products?.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3"><input type="number" className="w-20 rounded border border-[#dbe6de] dark:border-[#3a5840] bg-transparent px-2 py-1 text-sm focus:ring-primary focus:border-primary" value={line.quantity} onChange={(e) => { const newLines = [...currentSubscription.orderLines]; newLines[idx].quantity = parseFloat(e.target.value) || 0; const base = newLines[idx].quantity * newLines[idx].unitPrice; newLines[idx].subtotal = (base * (1 - (newLines[idx].discount || 0) / 100)).toFixed(2); setCurrentSubscription({ ...currentSubscription, orderLines: newLines }); }} /></td>
                                                    <td className="px-4 py-3">${line.unitPrice}</td>
                                                    <td className="px-4 py-3"><input type="number" className="w-20 rounded border border-[#dbe6de] dark:border-[#3a5840] bg-transparent px-2 py-1 text-sm focus:ring-primary focus:border-primary" value={line.discount || 0} onChange={(e) => { const newLines = [...currentSubscription.orderLines]; newLines[idx].discount = parseFloat(e.target.value) || 0; const base = newLines[idx].quantity * newLines[idx].unitPrice; newLines[idx].subtotal = (base * (1 - (newLines[idx].discount || 0) / 100)).toFixed(2); setCurrentSubscription({ ...currentSubscription, orderLines: newLines }); }} /></td>
                                                    <td className="px-4 py-3">{line.taxes}%</td>
                                                    <td className="px-4 py-3 text-right font-medium">${line.subtotal}</td>
                                                    <td className="px-4 py-3 text-center"><button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => { const newLines = currentSubscription.orderLines.filter((_, i) => i !== idx); setCurrentSubscription({ ...currentSubscription, orderLines: newLines }); }}><span className="material-symbols-outlined text-[18px]">delete</span></button></td>
                                                </tr>
                                            ))}
                                            <tr><td colSpan="7" className="px-4 py-3 text-primary hover:underline cursor-pointer font-medium" onClick={() => { const newLines = [...currentSubscription.orderLines, { product: '', productId: null, quantity: 1, unitPrice: 0, discount: 0, taxes: 0, subtotal: 0 }]; setCurrentSubscription({ ...currentSubscription, orderLines: newLines }); }}>Add a line</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeFormTab === 'otherInfo' && (
                            <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1"><label className="text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Sales person*</label><input type="text" className="form-input rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={currentSubscription.salesPerson || ''} onChange={(e) => setCurrentSubscription({ ...currentSubscription, salesPerson: e.target.value })} /></div>
                                    <div className="flex flex-col gap-1"><label className="text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Start date*</label><input type="date" className="form-input rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={currentSubscription.startDate || ''} onChange={(e) => setCurrentSubscription({ ...currentSubscription, startDate: e.target.value })} /></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1"><label className="text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Payment</label><select className="form-select rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-background-light dark:bg-[#15251a] px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={currentSubscription.paymentMethod || 'Credit Card'} onChange={(e) => setCurrentSubscription({ ...currentSubscription, paymentMethod: e.target.value })}><option>Credit Card</option><option>Bank Transfer</option><option>Manual Payment</option></select></div>
                                    <div className="flex items-center gap-3 pt-6"><div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="paymentDone" className="sr-only peer" checked={currentSubscription.paymentDone || false} onChange={(e) => setCurrentSubscription({ ...currentSubscription, paymentDone: e.target.checked })} /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-[#3a5840] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div><label htmlFor="paymentDone" className="ml-3 text-sm font-semibold text-[#111813] dark:text-[#e0e7e1]">Payment done</label></div></div>
                                </div>
                            </div>
                        )}

                        {activeFormTab === 'history' && (
                            <div className="animate-fade-in">
                                <h3 className="text-lg font-bold text-[#111813] dark:text-white mb-4">Payment & Invoice History</h3>
                                <div className="overflow-x-auto border border-[#dbe6de] dark:border-[#2a4531] rounded-lg">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-[#2a4531]/30 text-[#61896b] font-semibold border-b border-[#dbe6de] dark:border-[#2a4531]">
                                            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#dbe6de] dark:divide-[#2a4531]">
                                            {currentSubscription.history?.map((item, idx) => (
                                                <tr key={idx} className="bg-white dark:bg-[#1a2e1f]">
                                                    <td className="px-4 py-3 text-[#111813] dark:text-white">{item.date}</td>
                                                    <td className="px-4 py-3 text-[#61896b]">{item.type}</td>
                                                    <td className="px-4 py-3 font-medium text-primary hover:underline cursor-pointer" onClick={() => {
                                                        const inv = invoices.find(i => i.id === item.reference);
                                                        if (inv) onNavigate('invoices', inv);
                                                    }}>{item.reference}</td>
                                                    <td className="px-4 py-3 text-[#111813] dark:text-white">{item.amount}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.status === 'Paid' || item.status === 'Confirmed' ? 'bg-green-100 text-green-700' : item.status === 'Failed' || item.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {(!currentSubscription.history || currentSubscription.history.length === 0) && <div className="p-8 text-center text-[#61896b]">No history records found.</div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            {view === 'list' ? renderListView() : renderFormView()}
        </div>
    );
};

export default SubscriptionManager;