import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalHeader from './components/PortalHeader';
import api from './api';

const CartPage = () => {
    const [activeTab, setActiveTab] = useState('order');
    const [quantity, setQuantity] = useState(1);
    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const themeColor = '#2ecc71';

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const { data } = await api.get('/cart');
                setCartItems(data);
            } catch (error) {
                console.error("Failed to fetch cart", error);
            }
        };
        fetchCart();
    }, []);

    const handleRemove = async (id) => {
        try {
            await api.delete(`/cart/${id}`);
            setCartItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const handleCheckout = async () => {
        try {
            const { data } = await api.post('/orders', {});
            alert('Order placed successfully!');
            navigate('/portal/orders');
        } catch (error) {
            console.error("Failed to place order", error);
            alert("Failed to place order");
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    const styles = {
        container: {
            backgroundColor: '#f8faf9',
            minHeight: '100vh',
            color: '#111813',
            fontFamily: 'Inter, sans-serif',
            padding: '0',
        },
        mainWrapper: {
            padding: '40px 48px',
            maxWidth: '1200px',
            margin: '0 auto',
        },
        mainContainer: {
            backgroundColor: '#ffffff',
            border: `1px solid #dbe6de`,
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        },
        tabNav: {
            display: 'flex',
            gap: '40px',
            marginBottom: '40px',
            fontSize: '15px',
            borderBottom: '1px solid #f0f2f0',
        },
        tab: {
            cursor: 'pointer',
            padding: '16px 4px',
            color: '#61896b',
            transition: 'all 0.2s',
            fontWeight: '600',
            borderBottom: '2px solid transparent',
        },
        tabActive: {
            cursor: 'pointer',
            padding: '16px 4px',
            color: themeColor,
            borderBottom: `2px solid ${themeColor}`,
            fontWeight: '900',
        },
        contentArea: {
            display: 'flex',
            gap: '64px',
        },
        cartItems: {
            flex: 1,
        },
        cartItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #f0f2f0',
        },
        itemImage: {
            width: '120px',
            height: '100px',
            borderRadius: '16px',
            backgroundColor: '#f8faf9',
            border: `1px solid #dbe6de`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dbe6de',
            fontSize: '11px',
            fontWeight: 'bold',
        },
        itemDetails: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flex: 1,
        },
        itemName: {
            fontSize: '18px',
            fontWeight: '800',
            color: '#111813',
        },
        removeButton: {
            background: 'transparent',
            border: 'none',
            color: '#f44336',
            cursor: 'pointer',
            fontSize: '12px',
            width: 'fit-content',
            padding: '0',
            fontWeight: '600',
        },
        itemPrice: {
            fontSize: '16px',
            fontWeight: '900',
            color: '#111813',
            width: '160px',
            textAlign: 'right',
        },
        orderSummary: {
            width: '360px',
            backgroundColor: '#f8faf9',
            border: `1px solid #dbe6de`,
            padding: '32px',
            borderRadius: '20px',
            height: 'fit-content',
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#61896b',
            fontWeight: '500',
        },
        summaryTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '24px',
            fontSize: '20px',
            fontWeight: '900',
            paddingTop: '20px',
            borderTop: `1px solid #dbe6de`,
            color: '#111813',
        },
        discountRow: {
            display: 'flex',
            gap: '10px',
            marginBottom: '16px',
        },
        discountInput: {
            flex: 1,
            backgroundColor: '#ffffff',
            border: `1px solid #dbe6de`,
            padding: '12px 16px',
            color: '#111813',
            fontSize: '14px',
            borderRadius: '10px',
            outline: 'none',
        },
        applyButton: {
            backgroundColor: 'transparent',
            border: `2px solid ${themeColor}`,
            padding: '12px 20px',
            color: themeColor,
            cursor: 'pointer',
            fontSize: '13px',
            borderRadius: '10px',
            fontWeight: '800',
            transition: 'all 0.2s',
        },
        checkoutButton: {
            width: '100%',
            backgroundColor: themeColor,
            color: '#ffffff',
            border: 'none',
            padding: '18px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '900',
            borderRadius: '12px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(46,204,113,0.2)',
        },
    };

    return (
        <div style={styles.container}>
            <PortalHeader themeColor={themeColor} />

            <div style={styles.mainWrapper}>
                <div style={styles.mainContainer}>
                    <div style={styles.tabNav}>
                        <span
                            style={activeTab === 'order' ? styles.tabActive : styles.tab}
                            onClick={() => setActiveTab('order')}
                        >
                            1. Review Order
                        </span>
                        <span
                            style={activeTab === 'address' ? styles.tabActive : styles.tab}
                            onClick={() => setActiveTab('address')}
                        >
                            2. Shipping
                        </span>
                        <span
                            style={activeTab === 'payment' ? styles.tabActive : styles.tab}
                            onClick={() => setActiveTab('payment')}
                        >
                            3. Payment
                        </span>
                    </div>

                    {activeTab === 'order' && (
                        <div style={styles.contentArea}>
                            <div style={styles.cartItems}>
                                {cartItems.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center' }}>Your cart is empty.</div>
                                ) : (
                                    cartItems.map(item => (
                                        <div key={item.id} style={styles.cartItem}>
                                            <div style={styles.itemImage}>{item.name.substring(0, 3).toUpperCase()}</div>
                                            <div style={styles.itemDetails}>
                                                <div style={styles.itemName}>{item.name}</div>
                                                <div style={{ color: '#61896b', fontSize: '13px' }}>Qty: {item.quantity}</div>
                                                <button style={styles.removeButton} onClick={() => handleRemove(item.id)}>Remove</button>
                                            </div>
                                            <div style={styles.itemPrice}>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={styles.orderSummary}>
                                <div style={styles.summaryRow}>
                                    <span>Subtotal</span><span style={{ color: '#111813' }}>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div style={styles.summaryRow}>
                                    <span>GST (12%)</span><span style={{ color: '#111813' }}>₹{tax.toFixed(2)}</span>
                                </div>
                                <div style={styles.summaryTotal}>
                                    <span>Total</span><span style={{ color: themeColor }}>₹{total.toFixed(2)}</span>
                                </div>

                                <div style={styles.discountRow}>
                                    <input
                                        type="text"
                                        placeholder="Add coupon code"
                                        style={styles.discountInput}
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                    />
                                    <button
                                        style={styles.applyButton}
                                        onClick={() => setDiscountApplied(true)}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = themeColor; e.target.style.color = 'white'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = themeColor; }}
                                    >
                                        Apply
                                    </button>
                                </div>

                                {discountApplied && (
                                    <div style={{ backgroundColor: 'rgba(46,204,113,0.1)', color: '#2ecc71', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
                                        Best price guaranteed with coupon.
                                    </div>
                                )}

                                <button
                                    style={styles.checkoutButton}
                                    onClick={() => setActiveTab('address')}
                                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                                    onMouseOut={(e) => e.target.style.opacity = '1'}
                                >
                                    Proceed to Checkout
                                </button>

                                <div style={{ textAlign: 'center', marginTop: '16px', color: '#61896b', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined text-[14px]">lock</span>
                                    Secure checkout powered by Stripe
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'order' && (
                        <div style={{ padding: '64px', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '16px' }}>Almost there!</h2>
                            <p style={{ color: '#61896b', marginBottom: '32px' }}>This section is integrated with the secure payment gateway.</p>
                            <button style={{ ...styles.checkoutButton, width: 'auto', padding: '18px 48px' }} onClick={handleCheckout}>Complete My Purchase</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;
