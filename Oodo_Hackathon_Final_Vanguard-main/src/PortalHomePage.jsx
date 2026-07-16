import React, { useState, useEffect } from 'react';
import PortalHeader from './components/PortalHeader';
import api from './api';

export default function PortalHomePage() {
    const themeColor = '#2ecc71';
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUserName(data.name ? `, ${data.name.split(' ')[0]}` : '');
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };
        fetchUser();
    }, []);

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "#f8faf9",
            backgroundImage:
                "linear-gradient(rgba(46,204,113,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(46,204,113,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            color: '#111813',
            fontFamily: "Inter, sans-serif",
        },
        content: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 70px)",
            textAlign: 'center',
            padding: '0 24px',
        },
        badge: {
            backgroundColor: 'rgba(46,204,113,0.1)',
            color: themeColor,
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '1px',
            marginBottom: '24px',
            textTransform: 'uppercase',
        },
        heading: {
            fontSize: "72px",
            fontWeight: '900',
            letterSpacing: "-2px",
            marginBottom: '16px',
            color: '#111813',
            lineHeight: '1',
        },
        span: {
            color: themeColor,
        },
        subheading: {
            fontSize: '18px',
            color: '#61896b',
            maxWidth: '600px',
            lineHeight: '1.6',
        }
    };

    return (
        <div style={styles.page}>
            <PortalHeader themeColor={themeColor} />

            {/* Main Content */}
            <div style={styles.content}>
                <div style={styles.badge}>Customer Self-Service</div>
                <h1 style={styles.heading}>WELCOME{userName ? userName.toUpperCase() : ''}<span style={styles.span}>.</span></h1>
                <p style={styles.subheading}>Manage your active subscriptions, review billing history, and browse our cloud marketplace from a single interface.</p>
            </div>
        </div>
    );
}
