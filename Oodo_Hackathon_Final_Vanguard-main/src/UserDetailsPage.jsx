import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalHeader from './components/PortalHeader';
import api from './api';

const UserDetailsPage = () => {
    const themeColor = '#2ecc71';
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const { data } = await api.get('/auth/me');
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    company: data.company || '',
                    address: data.address || ''
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/profile', formData);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to update profile');
        }
    };

    const styles = {
        container: {
            backgroundColor: '#f8faf9',
            minHeight: '100vh',
            color: '#111813',
            fontFamily: 'Inter, sans-serif',
            padding: '0',
        },
        mainWrapper: {
            padding: '64px 32px',
            maxWidth: '1000px',
            margin: '0 auto',
        },
        headerRow: {
            marginBottom: '48px',
            textAlign: 'center',
        },
        title: {
            fontSize: '40px',
            fontWeight: '900',
            color: '#111813',
            letterSpacing: '-1.5px',
            marginBottom: '12px',
        },
        subtitle: {
            color: '#61896b',
            fontSize: '16px',
            fontWeight: '500',
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            backgroundColor: '#ffffff',
            padding: '56px',
            borderRadius: '32px',
            border: `1px solid #dbe6de`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
        },
        fieldGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        label: {
            fontSize: '11px',
            fontWeight: '900',
            color: '#61896b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
        },
        input: {
            backgroundColor: '#f8faf9',
            border: `1px solid #dbe6de`,
            padding: '16px 20px',
            borderRadius: '14px',
            color: '#111813',
            fontSize: '14px',
            fontWeight: '600',
            outline: 'none',
            transition: 'all 0.2s',
        },
        textarea: {
            backgroundColor: '#f8faf9',
            border: `1px solid #dbe6de`,
            padding: '16px 20px',
            borderRadius: '14px',
            color: '#111813',
            fontSize: '14px',
            fontWeight: '600',
            outline: 'none',
            minHeight: '120px',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
        },
        saveButton: {
            backgroundColor: themeColor,
            color: '#ffffff',
            border: 'none',
            padding: '20px 48px',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '900',
            cursor: 'pointer',
            marginTop: '16px',
            width: 'fit-content', // Changed to match previous style potentially
        } // Closing missing from original snippet but added here for safety if passing full object
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div style={styles.container}>
            <PortalHeader themeColor={themeColor} />
            <div style={styles.mainWrapper}>
                <div style={styles.headerRow}>
                    <h1 style={styles.title}>My Account</h1>
                    <p style={styles.subtitle}>Update your personal details and billing information.</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.formGrid}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Phone Number</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Company</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ ...styles.fieldGroup, gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Billing Address</label>
                        <textarea
                            style={styles.textarea}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' }}>
                        <button type="submit" style={styles.saveButton}>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserDetailsPage;
