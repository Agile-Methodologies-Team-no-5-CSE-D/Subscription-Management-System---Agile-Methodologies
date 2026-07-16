import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalHeader from './components/PortalHeader';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState('Professional');
    const [quantity, setQuantity] = useState(1);
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
            padding: '48px 32px',
            maxWidth: '1200px',
            margin: '0 auto',
        },
        productGrid: {
            display: 'grid',
            gridTemplateColumns: 'minmax(400px, 1fr) 520px',
            gap: '80px',
            alignItems: 'start',
        },
        imageSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
        },
        mainImage: {
            aspectRatio: '1.2',
            backgroundColor: '#ffffff',
            borderRadius: '32px',
            border: `1px solid #dbe6de`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dbe6de',
            fontSize: '14px',
            fontWeight: '900',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
        },
        breadcrumb: {
            display: 'flex',
            gap: '12px',
            fontSize: '13px',
            color: '#61896b',
            marginBottom: '32px',
            fontWeight: '600',
        },
        infoSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            backgroundColor: '#ffffff',
            padding: '48px',
            borderRadius: '32px',
            border: '1px solid #dbe6de',
            boxShadow: '0 4px 25px rgba(0,0,0,0.02)',
        },
        productTitle: {
            fontSize: '44px',
            fontWeight: '900',
            color: '#111813',
            lineHeight: '1',
            letterSpacing: '-1.5px',
        },
        productPrice: {
            fontSize: '32px',
            color: themeColor,
            fontWeight: '900',
        },
        sectionLabel: {
            fontSize: '11px',
            fontWeight: '900',
            color: '#61896b',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '16px',
        },
        variantGrid: {
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
        },
        variantButton: {
            padding: '14px 28px',
            borderRadius: '14px',
            border: `1px solid #dbe6de`,
            backgroundColor: '#f8faf9',
            color: '#111813',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '700',
            transition: 'all 0.2s',
        },
        variantButtonActive: {
            borderColor: themeColor,
            backgroundColor: 'rgba(46,204,113,0.1)',
            color: themeColor,
            boxShadow: `0 4px 15px rgba(46,204,113,0.1)`,
        },
        quantityControls: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8faf9',
            border: `1px solid #dbe6de`,
            borderRadius: '14px',
            width: 'fit-content',
            overflow: 'hidden',
        },
        qtyBtn: {
            border: 'none',
            background: 'transparent',
            color: '#111813',
            padding: '14px 24px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
        },
        addToCart: {
            flex: 1,
            backgroundColor: themeColor,
            color: '#ffffff',
            border: 'none',
            padding: '22px',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '900',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 8px 30px rgba(46,204,113,0.2)',
        },
        buyNow: {
            flex: 1,
            backgroundColor: '#111813',
            color: '#ffffff',
            border: 'none',
            padding: '22px',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '900',
            cursor: 'pointer',
            transition: 'all 0.2s',
        },
        description: {
            fontSize: '15px',
            lineHeight: '1.7',
            color: '#61896b',
            fontWeight: '500',
        }
    };

    return (
        <div style={styles.container}>
            <PortalHeader themeColor={themeColor} />

            <div style={styles.mainWrapper}>
                <div style={styles.breadcrumb}>
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate('/portal/shop')}>Shop Marketplace</span>
                    <span style={{ opacity: 0.3 }}>/</span>
                    <span style={{ color: '#111813' }}>Enterprise CRM Pro</span>
                </div>

                <div style={styles.productGrid}>
                    <div style={styles.imageSection}>
                        <div style={styles.mainImage}>PRODUCT VISUALIZATION</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ aspectRatio: '1', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #dbe6de' }}></div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.infoSection}>
                        <div>
                            <div style={{ color: themeColor, fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Top Rated Solution</div>
                            <h1 style={styles.productTitle}>Enterprise CRM Pro</h1>
                        </div>

                        <div style={styles.productPrice}>₹960.00 <span style={{ fontSize: '15px', color: '#61896b', fontWeight: '500' }}>/ user / month</span></div>

                        <div>
                            <div style={styles.sectionLabel}>Choose License Type</div>
                            <div style={styles.variantGrid}>
                                {['Starter', 'Professional', 'Enterprise'].map(v => (
                                    <button
                                        key={v}
                                        style={selectedVariant === v ? { ...styles.variantButton, ...styles.variantButtonActive } : styles.variantButton}
                                        onClick={() => setSelectedVariant(v)}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={styles.sectionLabel}>License Count</div>
                            <div style={styles.quantityControls}>
                                <button style={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                <span style={{ padding: '0 24px', color: '#111813', fontWeight: '900', borderLeft: '1px solid #dbe6de', borderRight: '1px solid #dbe6de', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                                <button style={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button
                                style={styles.addToCart}
                                onClick={() => navigate('/portal/cart')}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                Add to Cart
                            </button>
                            <button
                                style={styles.buyNow}
                                onClick={() => navigate('/portal/cart')}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#222'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#111813'}
                            >
                                Buy Now
                            </button>
                        </div>

                        <div style={{ borderTop: '1px solid #f0f2f0', paddingTop: '32px' }}>
                            <div style={styles.sectionLabel}>Product Highlights</div>
                            <p style={styles.description}>
                                Scalable CRM solution with AI-powered insights, automated lead management,
                                and seamless integration with your accounting software. Manage global teams
                                with ease and secure data protection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
