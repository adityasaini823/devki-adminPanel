import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../config/axios';
import './Settings.css';

// Create a new API service for settings if not exists, 
// or simpler to just direct fetch here for this specific page
// assuming api helper manages auth token.

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [settings, setSettings] = useState({
        payment: {
            upi_id: '',
            minimum_deposit: 10,
            minimum_withdrawal: 100
        },
        general: {
            app_name: 'Devki App',
            support_email: ''
        }
    });

    const fetchSettings = async () => {
        try {
            setLoading(true);
            // Using existing axios instance 'api'
            const response = await api.get('/api/settings');
            if (response.data.success) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            toast.error('Failed to load settings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const response = await api.put('/api/settings', settings);
            if (response.data.success) {
                toast.success('Settings updated successfully');
                setSettings(response.data.settings);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading settings...</div>;
    }

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1 className="settings-title">System Settings</h1>
                <p className="settings-subtitle">Manage global application configurations and payment gateways</p>
            </header>

            <form onSubmit={handleSubmit} className="settings-content">
                {/* Payment Settings Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-icon">💳</div>
                        <h2 className="card-title">Payment Configuration</h2>
                    </div>

                    <div className="form-group">
                        <label className="form-label">UPI ID (for Deposits)</label>
                        <input
                            type="text"
                            value={settings.payment?.upi_id || ''}
                            onChange={(e) => handleChange('payment', 'upi_id', e.target.value)}
                            className="form-input"
                            placeholder="e.g. merchant@upi"
                        />
                        <p className="form-hint">Users will send payments to this UPI address.</p>
                    </div>

                    <div className="input-row">
                        <div className="form-group">
                            <label className="form-label">Min Deposit (₹)</label>
                            <input
                                type="number"
                                value={settings.payment?.minimum_deposit || ''}
                                onChange={(e) => handleChange('payment', 'minimum_deposit', parseInt(e.target.value))}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Min Withdrawal (₹)</label>
                            <input
                                type="number"
                                value={settings.payment?.minimum_withdrawal || ''}
                                onChange={(e) => handleChange('payment', 'minimum_withdrawal', parseInt(e.target.value))}
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                {/* General Settings Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-icon">⚙️</div>
                        <h2 className="card-title">General Configuration</h2>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Application Name</label>
                        <input
                            type="text"
                            value={settings.general?.app_name || ''}
                            onChange={(e) => handleChange('general', 'app_name', e.target.value)}
                            className="form-input"
                        />
                        <p className="form-hint">Displayed in emails and the app header.</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Support Email</label>
                        <input
                            type="email"
                            value={settings.general?.support_email || ''}
                            onChange={(e) => handleChange('general', 'support_email', e.target.value)}
                            className="form-input"
                        />
                        <p className="form-hint">Where user support queries will be sent.</p>
                    </div>
                </div>

                <div className="settings-actions">
                    <button
                        type="submit"
                        disabled={updating}
                        className="save-button"
                    >
                        {updating ? (
                            <>
                                <span className="animate-spin">🔄</span> Saving...
                            </>
                        ) : (
                            <>
                                💾 Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
