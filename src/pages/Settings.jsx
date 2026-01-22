import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../config/axios';
import './Settings.css';

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [settings, setSettings] = useState({
        payment: {
            upi_id: '',
            minimum_deposit: 10,
            minimum_withdrawal: 100
        },
        delivery: {
            slots: []
        },
        general: {
            app_name: 'Devki App',
            support_email: ''
        }
    });

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/settings');
            if (response.data.success) {
                // Ensure slots is initialized if missing
                const fetchedSettings = response.data.settings;
                if (!fetchedSettings.delivery) {
                    fetchedSettings.delivery = { slots: [] };
                }
                setSettings(fetchedSettings);
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

    // Delivery Slot Handlers
    const handleSlotChange = (index, field, value) => {
        const newSlots = [...(settings.delivery?.slots || [])];
        newSlots[index] = { ...newSlots[index], [field]: value };

        setSettings(prev => ({
            ...prev,
            delivery: {
                ...prev.delivery,
                slots: newSlots
            }
        }));
    };

    const handleAddSlot = () => {
        const newSlot = {
            id: Date.now().toString(),
            label: 'New Slot',
            startTime: '12:00',
            endTime: '13:00',
            isEnabled: true
        };

        setSettings(prev => ({
            ...prev,
            delivery: {
                ...prev.delivery,
                slots: [...(prev.delivery?.slots || []), newSlot]
            }
        }));
    };

    const handleRemoveSlot = (index) => {
        const newSlots = [...(settings.delivery?.slots || [])];
        newSlots.splice(index, 1);

        setSettings(prev => ({
            ...prev,
            delivery: {
                ...prev.delivery,
                slots: newSlots
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
                <p className="settings-subtitle">Manage global application configurations</p>
            </header>

            <form onSubmit={handleSubmit} className="settings-content">

                {/* Delivery Timings Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-icon">⏰</div>
                        <h2 className="card-title">Delivery Timings</h2>
                    </div>

                    <div className="slots-container">
                        {settings.delivery?.slots?.map((slot, index) => (
                            <div key={index} className="slot-item">
                                <div className="slot-label-group">
                                    <label className="form-label text-xs">Label</label>
                                    <input
                                        type="text"
                                        value={slot.label}
                                        onChange={(e) => handleSlotChange(index, 'label', e.target.value)}
                                        className="form-input"
                                        placeholder="Morning"
                                    />
                                </div>
                                <div className="slot-time-group">
                                    <label className="form-label text-xs">Start Time</label>
                                    <input
                                        type="time"
                                        value={slot.startTime}
                                        onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="slot-time-group">
                                    <label className="form-label text-xs">End Time</label>
                                    <input
                                        type="time"
                                        value={slot.endTime}
                                        onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="slot-active-group">
                                    <label className="form-label text-xs">Active</label>
                                    <input
                                        type="checkbox"
                                        checked={slot.isEnabled}
                                        onChange={(e) => handleSlotChange(index, 'isEnabled', e.target.checked)}
                                        style={{ width: '1.25rem', height: '1.25rem', cursor: 'cursor' }}
                                    />
                                </div>
                                <div className="slot-delete-group">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSlot(index)}
                                        className="btn-delete"
                                        style={{ padding: '0.5rem' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={handleAddSlot}
                            className="btn-add"
                            style={{ marginTop: '0.5rem' }}
                        >
                            + Add Delivery Slot
                        </button>
                    </div>
                </div>

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
                    </div>

                    <div className="form-group">
                        <label className="form-label">Support Email</label>
                        <input
                            type="email"
                            value={settings.general?.support_email || ''}
                            onChange={(e) => handleChange('general', 'support_email', e.target.value)}
                            className="form-input"
                        />
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
