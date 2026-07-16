import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalHeader from './components/PortalHeader';
import api from './api';

const ShopPage = () => {
    const [productTypeOpen, setProductTypeOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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
        mainContent: {
            display: 'flex',
            gap: '32px',
            padding: '40px 48px',
            maxWidth: '1440px',
            margin: '0 auto',
        },
        sidebar: {
            width: '240px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
        },
        sidebarSection: {
            border: `1px solid #dbe6de`,
            padding: '24px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        },
        sidebarTitle: {
            fontSize: '12px',
            fontWeight: '900',
            marginBottom: '16px',
            color: '#111813',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        sidebarItem: {
            fontSize: '14px',
            color: '#61896b',
            cursor: 'pointer',
            marginBottom: '10px',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        contentArea: {
            flex: 1,
        },
        filterRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            gap: '20px',
            backgroundColor: '#ffffff',
            padding: '16px 24px',
            borderRadius: '16px',
            border: '1px solid #dbe6de',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        },
        filterLeft: {
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
        },
        dropdown: {
            position: 'relative',
        },
        dropdownButton: {
            border: `1px solid #dbe6de`,
            padding: '10px 16px',
            backgroundColor: '#f8faf9',
            color: '#111813',
            cursor: 'pointer',
            fontSize: '13px',
            minWidth: '160px',
            textAlign: 'left',
            borderRadius: '10px',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        dropdownMenu: {
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            backgroundColor: '#ffffff',
            border: `1px solid #dbe6de`,
            zIndex: 10,
            minWidth: '160px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        },
        dropdownItem: {
            padding: '12px 16px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#111813',
            borderBottom: `1px solid #f0f2f0`,
            transition: 'background 0.2s',
        },
        searchInput: {
            border: `1px solid #dbe6de`,
            padding: '10px 44px 10px 16px',
            backgroundColor: '#f8faf9',
            color: '#111813',
            fontSize: '13px',
            width: '280px',
            outline: 'none',
            borderRadius: '10px',
            transition: 'all 0.2s',
        },
        productGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '32px',
        },
        productCard: {
            backgroundColor: '#ffffff',
            border: `1px solid #dbe6de`,
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            boxShadow: '0 2px 15px rgba(0,0,0,0.02)',
        },
        productImage: {
            aspectRatio: '1.2',
            backgroundColor: '#f8faf9',
            borderRadius: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#dbe6de',
            fontWeight: 'bold',
            border: '1px solid #f0f2f0',
        },
        productBadge: {
            position: 'absolute',
            top: '32px',
            left: '32px',
            fontSize: '10px',
            backgroundColor: themeColor,
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '20px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        productName: {
            fontSize: '16px',
            fontWeight: '800',
            color: '#111813',
            marginBottom: '6px',
        },
        productPrice: {
            fontSize: '15px',
            color: themeColor,
            fontWeight: '900',
        },
        productBilling: {
            fontSize: '12px',
            color: '#61896b',
            fontWeight: '500',
        },
    };

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                // Map API data to UI format if needed
                const formatted = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: `$${p.price}`,
                    badge: p.type === 'software' ? 'License' : null,
                    billing: 'Monthly' // or fetch from backend if available
                }));
                setProducts(formatted);
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = async (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            await api.post('/cart', { productId: product.id, quantity: 1 });
            alert('Added to cart!');
        } catch (error) {
            console.error("Failed to add to cart", error);
            alert("Failed to add to cart");
        }
    };

    return (
        <div style={styles.container}>
            <PortalHeader themeColor={themeColor} />

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Sidebar */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarSection}>
                        <div style={styles.sidebarTitle}>Categories</div>
                        <div style={styles.sidebarItem}>Cloud Services</div>
                        <div style={styles.sidebarItem}>Productivity</div>
                        <div style={styles.sidebarItem}>Infrastructure</div>
                    </div>
                    <div style={styles.sidebarSection}>
                        <div style={styles.sidebarTitle}>Subscriptions</div>
                        <div style={styles.sidebarItem}>Monthly Plans</div>
                        <div style={styles.sidebarItem}>Yearly Plans</div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={styles.contentArea}>
                    {/* Filter Row */}
                    <div style={styles.filterRow}>
                        <div style={styles.filterLeft}>
                            <div style={styles.dropdown}>
                                <button
                                    style={styles.dropdownButton}
                                    onClick={() => setProductTypeOpen(!productTypeOpen)}
                                >
                                    All Categories <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                </button>
                                {productTypeOpen && (
                                    <div style={styles.dropdownMenu}>
                                        <div style={styles.dropdownItem} onClick={() => setProductTypeOpen(false)}>All Categories</div>
                                        <div style={styles.dropdownItem} onClick={() => setProductTypeOpen(false)}>Cloud</div>
                                        <div style={styles.dropdownItem} onClick={() => setProductTypeOpen(false)}>Services</div>
                                    </div>
                                )}
                            </div>

                            {/* Search Input */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search marketplace..."
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={(e) => e.target.style.borderColor = themeColor}
                                    onBlur={(e) => e.target.style.borderColor = '#dbe6de'}
                                />
                                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '14px', top: '10px', fontSize: '20px', color: '#61896b' }}>search</span>
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div style={styles.dropdown}>
                            <button
                                style={styles.dropdownButton}
                                onClick={() => setSortOpen(!sortOpen)}
                            >
                                Sort By <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </button>
                            {sortOpen && (
                                <div style={styles.dropdownMenu}>
                                    <div style={styles.dropdownItem} onClick={() => setSortOpen(false)}>Price: Low to High</div>
                                    <div style={styles.dropdownItem} onClick={() => setSortOpen(false)}>Price: High to Low</div>
                                    <div style={styles.dropdownItem} onClick={() => setSortOpen(false)}>Newest Arrivals</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div style={styles.productGrid}>
                        {products.map((product) => (
                            <div
                                key={product.id}
                                style={styles.productCard}
                                onClick={() => addToCart(product)} // Changed from navigate to addToCart for now, or navigate to detail then add
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = themeColor; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#dbe6de'; e.currentTarget.style.boxShadow = '0 2px 15px rgba(0,0,0,0.02)'; }}
                            >
                                <div style={styles.productImage}>PREVIEW</div>
                                {product.badge && (
                                    <span style={styles.productBadge}>{product.badge}</span>
                                )}
                                <div style={styles.productName}>{product.name}</div>
                                <div style={styles.productPrice}>{product.price}</div>
                                <div style={styles.productBilling}>{product.billing}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
