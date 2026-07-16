import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalHeader from './components/PortalHeader';
import api from './api';

const OrdersPage = () => {
    const navigate = useNavigate();
    const themeColor = '#2ecc71';

    const styles = {
        container: {
            backgroundColor: '#f8faf9',
            minHeight: '100vh',
            color: '#111813',
            fontFamily: 'Inter, sans-serif',
            padding: '0',
        },
        mainWrapper: {
            display: 'flex',
            padding: '40px 48px',
            maxWidth: '1440px',
            margin: '0 auto',
            gap: '32px',
        },
        sidebar: {
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
        menuBox: {
            border: `1px solid #dbe6de`,
            padding: '18px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            color: '#61896b',
            transition: 'all 0.2s',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        },
        menuBoxActive: {
            backgroundColor: '#ffffff',
            borderColor: themeColor,
            color: themeColor,
            boxShadow: '0 4px 15px rgba(46,204,113,0.1)',
        },
        mainContainer: {
            flex: 1,
            backgroundColor: '#ffffff',
            border: `1px solid #dbe6de`,
            padding: '40px',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        },
        orderHeader: {
            fontSize: '24px',
            fontWeight: '900',
            marginBottom: '32px',
            color: '#111813',
            letterSpacing: '-0.5px',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        tableHeader: {
            backgroundColor: '#f8faf9',
            borderBottom: `1px solid #dbe6de`,
            textAlign: 'left',
        },
        headerCell: {
            padding: '16px 24px',
            fontSize: '11px',
            fontWeight: '900',
            color: '#61896b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
        },
        row: {
            borderBottom: '1px solid #f0f2f0',
            cursor: 'pointer',
            transition: 'background 0.2s',
        },
        cell: {
            padding: '20px 24px',
            fontSize: '14px',
            color: '#111813',
        },
        badge: {
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '800',
        },
        idBadge: {
            color: themeColor,
            fontWeight: '900',
        }
    };

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const { data } = await api.get('/orders');
                // Map API data
                const formatted = data.map(o => ({
                    id: `S${String(o.id).padStart(4, '0')}`,
                    date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    total: `₹${o.recurring_amount}`,
                    status: o.status,
                    statusColor: o.status === 'Confirmed' ? '#2ecc71' : o.status === 'Cancelled' ? '#e74c3c' : '#f1c40f'
                }));
                setOrders(formatted);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div style={styles.container}>
            <PortalHeader themeColor={themeColor} />

            <div style={styles.mainWrapper}>
                <div style={styles.sidebar}>
                    <div
                        style={styles.menuBox}
                        onClick={() => navigate('/portal/account')}
                        onMouseOver={(e) => e.target.style.borderColor = themeColor}
                        onMouseOut={(e) => e.target.style.borderColor = '#dbe6de'}
                    >
                        <span className="material-symbols-outlined">account_circle</span>
                        Account Settings
                    </div>
                    <div
                        style={{ ...styles.menuBox, ...styles.menuBoxActive }}
                        onClick={() => navigate('/portal/orders')}
                    >
                        <span className="material-symbols-outlined">history</span>
                        Order History
                    </div>
                </div>

                <div style={styles.mainContainer}>
                    <div style={styles.orderHeader}>My Order History</div>

                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.headerCell}>Reference</th>
                                <th style={styles.headerCell}>Order Date</th>
                                <th style={styles.headerCell}>Status</th>
                                <th style={{ ...styles.headerCell, textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    style={styles.row}
                                    onClick={() => navigate(`/portal/order/${order.id}`)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8faf9'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ ...styles.cell, ...styles.idBadge }}>{order.id}</td>
                                    <td style={styles.cell}>{order.date}</td>
                                    <td style={styles.cell}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: `${order.statusColor}15`,
                                            color: order.statusColor,
                                            border: `1px solid ${order.statusColor}30`
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.cell, textAlign: 'right', fontWeight: '900' }}>{order.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
