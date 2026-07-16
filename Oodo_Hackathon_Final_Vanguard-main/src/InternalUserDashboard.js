import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser } from './authService';
import api from './api';
import SubscriptionManager from './SubscriptionManager';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import ProductsTable from './ProductsTable';
import ProductForm from './ProductForm';
import PaymentHistory from './PaymentHistory';

const InternalUserDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const storedUser = getStoredUser() || {};
    const userRole = storedUser.role || 'admin';
    const userName = storedUser.name || 'Admin User';
    const userEmail = storedUser.email || 'internal@test.com';
    const [activeTab, setActiveTab] = useState('dashboard');
    const [tabPayload, setTabPayload] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({ activeSubscriptions: 0, pendingInvoices: 0, todaysCollections: 0 });

    const [productView, setProductView] = useState('list'); // 'list' or 'form'
    const [customerView, setCustomerView] = useState('list'); // 'list' or 'form'
    const [invoiceView, setInvoiceView] = useState('list'); // 'list', 'detail', or 'form'

    const fetchData = async () => {
        try {
            const [subsRes, invsRes, prodsRes, custsRes, statsRes] = await Promise.all([
                api.get('/subscriptions'),
                api.get('/invoices'),
                api.get('/products?admin=true'),
                api.get('/auth/users'),
                api.get('/dashboard/stats')
            ]);

            setSubscriptions(subsRes.data);
            setInvoices(invsRes.data);
            setProducts(prodsRes.data);

            // Calculate stats for customers
            const rawCustomers = custsRes.data;
            const subs = subsRes.data;
            const enrichedCustomers = rawCustomers.filter(u => u.role !== 'admin').map(cust => { // Filter out admins if needed, or keep all
                const userSubs = subs.filter(s => s.customer_id === cust.id || s.customer === cust.name); // Handle ID or Name match
                // Note: db subscriptions have customer_id. API returns it. But also customer name maybe?
                // Let's check routes/subscriptions.js. It returns customer_name as customer.
                // But it also returns customer_id.
                // So s.customer_id === cust.id is safer.

                const activeSubs = userSubs.filter(s => s.status === 'Confirmed' || s.status === 'Active');
                const totalRevenue = userSubs.reduce((acc, s) => acc + (parseFloat(s.recurring_amount) || 0), 0);
                // Status: Active if has active subs, else Inactive/Prospect
                const status = activeSubs.length > 0 ? 'Active' : userSubs.length > 0 ? 'Churned' : 'Prospect';

                return {
                    ...cust,
                    subscriptions: activeSubs.length,
                    totalRevenue: `$${totalRevenue.toFixed(2)}`,
                    status: status
                };
            });
            setCustomers(enrichedCustomers);

            setDashboardStats(statsRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        fetchData();
        // Set up interval to refresh data periodically or use websocket in real app
        // For now, simple poll every 30s
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (tab, payload = null) => {
        setActiveTab(tab);
        setTabPayload(payload);
        // Reset sub-views when switching main tabs
        setProductView('list');
        setCustomerView('list');
        setInvoiceView(payload ? 'detail' : 'list');
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const handleInvoiceStatusChange = async (invoiceId, newStatus) => {
        try {
            await api.patch(`/invoices/${invoiceId}/status`, { status: newStatus });
            // Refresh data to ensure consistency (especially subscription history)
            fetchData();
        } catch (error) {
            console.error("Failed to update invoice status", error);
            alert("Failed to update invoice status");
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#1a2e1f] p-6 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                            <h3 className="text-[#61896b] font-semibold mb-2">Active Subscriptions</h3>
                            <p className="text-3xl font-bold text-[#111813] dark:text-white">{dashboardStats.activeSubscriptions}</p>
                        </div>
                        <div className="bg-white dark:bg-[#1a2e1f] p-6 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                            <h3 className="text-[#61896b] font-semibold mb-2">Pending Invoices</h3>
                            <p className="text-3xl font-bold text-[#111813] dark:text-white">{dashboardStats.pendingInvoices}</p>
                        </div>
                        <div className="bg-white dark:bg-[#1a2e1f] p-6 rounded-xl shadow-sm border border-[#dbe6de] dark:border-[#2a4531]">
                            <h3 className="text-[#61896b] font-semibold mb-2">Today's Collections</h3>
                            <p className="text-3xl font-bold text-[#111813] dark:text-white">${dashboardStats.todaysCollections}</p>
                        </div>
                    </div>
                );
            case 'subscriptions':
                return (
                    <SubscriptionManager
                        onNavigate={handleTabChange}
                        subscriptions={subscriptions}
                        setSubscriptions={setSubscriptions} // Or handleSave inside to call fetchData
                        invoices={invoices}
                        setInvoices={setInvoices}
                        userRole={userRole}
                        products={products}
                        customers={customers}
                    />
                );
            case 'customers':
                return customerView === 'list' ? (
                    <CustomerList
                        customers={customers}
                        onNew={() => setCustomerView('form')}
                        userRole={userRole}
                    />
                ) : (
                    <CustomerForm
                        onSave={() => {
                            fetchData(); // Refresh list including new customer
                            setCustomerView('list');
                        }}
                        onDiscard={() => setCustomerView('list')}
                    />
                );
            case 'products':
                return productView === 'list' ? (
                    <ProductsTable
                        products={products}
                        onNew={() => setProductView('form')}
                    />
                ) : (
                    <ProductForm
                        onSave={() => {
                            fetchData(); // Refresh list including new product
                            setProductView('list');
                        }}
                        onDiscard={() => setProductView('list')}
                    />
                );
            case 'invoices':
                if (invoiceView === 'form') {
                    return (
                        <InvoiceForm
                            customers={customers}
                            onSave={() => {
                                fetchData();
                                setInvoiceView('list');
                            }}
                            onDiscard={() => setInvoiceView('list')}
                        />
                    );
                }
                return (
                    <InvoiceList
                        initialInvoice={tabPayload}
                        invoices={invoices}
                        onStatusChange={handleInvoiceStatusChange}
                        onNew={() => setInvoiceView('form')}
                    />
                );
            case 'payments':
                return <PaymentHistory />;
            case 'reports':
                return <div className="p-6 bg-white dark:bg-[#1a2e1f] rounded-xl border border-[#dbe6de] dark:border-[#2a4531]">Operational Reports Placeholder</div>;
            default:
                return <div>Select an item</div>;
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#1a2e1f] border-r border-[#dbe6de] dark:border-[#2a4531] flex flex-col">
                <div className="p-6 border-b border-[#dbe6de] dark:border-[#2a4531]">
                    <h1 className="text-xl font-bold text-primary">Internal Portal</h1>
                    <p className="text-xs text-[#61896b]">Operational Access Only</p>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        <li>
                            <button
                                onClick={() => handleTabChange('dashboard')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-[#61896b] hover:bg-gray-50 dark:hover:bg-[#2a4531]/50'}`}
                            >
                                <span className="material-symbols-outlined">dashboard</span>
                                Dashboard
                            </button>
                        </li>

                        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-[#61896b]/60 uppercase tracking-wider">
                            Management
                        </div>

                        <li>
                            <button
                                onClick={() => handleTabChange('subscriptions')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'subscriptions' ? 'bg-primary/10 text-primary' : 'text-[#61896b] hover:bg-gray-50 dark:hover:bg-[#2a4531]/50'}`}
                            >
                                <span className="material-symbols-outlined">subscriptions</span>
                                Subscriptions
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleTabChange('products')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-[#61896b] hover:bg-gray-50 dark:hover:bg-[#2a4531]/50'}`}
                            >
                                <span className="material-symbols-outlined">inventory_2</span>
                                Products
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleTabChange('customers')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'customers' ? 'bg-primary/10 text-primary' : 'text-[#61896b] hover:bg-gray-50 dark:hover:bg-[#2a4531]/50'}`}
                            >
                                <span className="material-symbols-outlined">group</span>
                                Customers
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleTabChange('invoices')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'invoices' ? 'bg-primary/10 text-primary' : 'text-[#61896b] hover:bg-gray-50 dark:hover:bg-[#2a4531]/50'}`}
                            >
                                <span className="material-symbols-outlined">receipt_long</span>
                                Invoices
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleTabChange('payments')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payments' ? 'bg-primary/10 text-primary' : 'text-[#61896b] hover:bg-gray-50 dark:hover:bg-[#2a4531]/50'}`}
                            >
                                <span className="material-symbols-outlined">payments</span>
                                Payments
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleTabChange('reports')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reports' ? 'bg-primary/10 text-primary' : 'text-[#61896b] hover:bg-gray-50 dark:hover:bg-[#2a4531]/50'}`}
                            >
                                <span className="material-symbols-outlined">bar_chart</span>
                                Reports
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-[#dbe6de] dark:border-[#2a4531]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#111813] dark:text-white truncate">{userName}</p>
                            <p className="text-xs text-[#61896b] truncate">{userEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white dark:bg-[#1a2e1f] border-b border-[#dbe6de] dark:border-[#2a4531] p-4 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-[#111813] dark:text-white capitalize">{activeTab}</h2>
                </header>

                <div className="p-6">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default InternalUserDashboard;
