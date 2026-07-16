import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../authService';

const PortalHeader = ({ themeColor = '#2ecc71' }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const navigate = useNavigate();

    const styles = {
        navbar: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 48px",
            borderBottom: '1px solid #dbe6de',
            backgroundColor: "#ffffff",
            color: '#111813',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
        },
        leftNav: {
            display: "flex",
            alignItems: "center",
            gap: "40px",
        },
        logo: {
            color: themeColor,
            fontSize: '20px',
            fontWeight: '900',
            cursor: "pointer",
            letterSpacing: '-0.5px',
        },
        navLinks: {
            display: "flex",
            gap: "24px",
            fontSize: '14px',
            fontWeight: '600',
        },
        navItem: {
            cursor: "pointer",
            color: '#61896b',
            transition: 'color 0.2s',
        },
        rightNav: {
            display: "flex",
            alignItems: "center",
            gap: "16px",
        },
        button: {
            background: "transparent",
            border: `1px solid #dbe6de`,
            color: '#111813',
            padding: "8px 20px",
            borderRadius: '8px',
            cursor: "pointer",
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s',
        },
        profileBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: '#f8faf9',
            border: '1px solid #dbe6de',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            color: '#111813',
        },
        dropdown: {
            position: "absolute",
            top: "45px",
            right: 0,
            border: "1px solid #dbe6de",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            zIndex: 1000,
            minWidth: '200px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            overflow: 'hidden',
        },
        dropdownItem: {
            background: "transparent",
            border: "none",
            color: '#111813',
            padding: "12px 20px",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            fontSize: '13px',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
    };

    return (
        <div style={styles.navbar}>
            {/* Left */}
            <div style={styles.leftNav}>
                <div style={styles.logo} onClick={() => navigate('/portal/home')}>SAAS<span style={{ color: '#111813' }}>PORTAL</span></div>
                <nav style={styles.navLinks}>
                    <span style={styles.navItem} onClick={() => navigate('/portal/home')} onMouseOver={(e) => e.target.style.color = themeColor} onMouseOut={(e) => e.target.style.color = '#61896b'}>Home</span>
                    <span style={styles.navItem} onClick={() => navigate('/portal/shop')} onMouseOver={(e) => e.target.style.color = themeColor} onMouseOut={(e) => e.target.style.color = '#61896b'}>Shop</span>
                    <span style={styles.navItem} onClick={() => navigate('/portal/account')} onMouseOver={(e) => e.target.style.color = themeColor} onMouseOut={(e) => e.target.style.color = '#61896b'}>My Account</span>
                </nav>
            </div>

            {/* Right */}
            <div style={styles.rightNav}>
                <button
                    style={styles.button}
                    onClick={() => navigate('/portal/cart')}
                    onMouseOver={(e) => { e.target.style.borderColor = themeColor; e.target.style.color = themeColor; }}
                    onMouseOut={(e) => { e.target.style.borderColor = '#dbe6de'; e.target.style.color = '#111813'; }}
                >
                    Cart (0)
                </button>

                <div style={{ position: "relative" }}>
                    <div
                        style={styles.profileBtn}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                        My Profile
                    </div>

                    {showProfileMenu && (
                        <div style={styles.dropdown}>
                            <button
                                style={styles.dropdownItem}
                                onClick={() => { navigate('/portal/account'); setShowProfileMenu(false); }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#f8faf9'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#61896b]">person</span>
                                User details
                            </button>
                            <button
                                style={styles.dropdownItem}
                                onClick={() => { navigate('/portal/orders'); setShowProfileMenu(false); }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#f8faf9'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#61896b]">shopping_bag</span>
                                My orders
                            </button>
                            <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }}></div>
                            <button
                                style={{ ...styles.dropdownItem, color: '#f44336' }}
                                onClick={() => { logout(); navigate('/login'); }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#fff5f5'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortalHeader;
