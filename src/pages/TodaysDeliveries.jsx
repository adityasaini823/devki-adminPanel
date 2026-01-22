import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../config/axios';
import './DataTable.css';

const TodaysDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generateLoading, setGenerateLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('date', selectedDate);
            if (statusFilter) params.append('status', statusFilter);
            if (timeFilter) params.append('delivery_time', timeFilter);
            params.append('page', pagination.page);
            params.append('limit', 50);

            const response = await api.get(`/api/deliveries/by-date?${params.toString()}`);
            if (response.data.success) {
                setDeliveries(response.data.deliveries);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to load deliveries');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateDeliveries = async () => {
        try {
            setGenerateLoading(true);
            const response = await api.post('/api/deliveries/generate?days=7');
            if (response.data.success) {
                toast.success(`Generated deliveries: ${response.data.deliveriesCreated || 0} new, ${response.data.subscriptionsProcessed || 0} subscriptions processed`);
                fetchDeliveries();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate deliveries');
            console.error(error);
        } finally {
            setGenerateLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, [selectedDate, statusFilter, timeFilter, pagination.page]);

    const handleMarkDelivered = async (id) => {
        try {
            setActionLoading(id);
            await api.patch(`/api/deliveries/${id}/deliver`);
            toast.success('Delivery marked as delivered, wallet charged');
            fetchDeliveries();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark delivered');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSkip = async (id) => {
        try {
            setActionLoading(id);
            await api.patch(`/api/deliveries/${id}/admin-skip`, { notes: 'Skipped by admin' });
            toast.success('Delivery skipped (no charge)');
            fetchDeliveries();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to skip delivery');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkMissed = async (id) => {
        try {
            setActionLoading(id);
            await api.patch(`/api/deliveries/${id}/missed`, { notes: 'Marked missed by admin' });
            toast.success('Delivery marked as missed (no charge)');
            fetchDeliveries();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark missed');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: '#3b82f6',
            delivered: '#10b981',
            skipped: '#6b7280',
            missed: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    const statuses = ['scheduled', 'delivered', 'skipped', 'missed'];

    return (
        <div className="data-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>📦 Today's Deliveries</h1>
                    <p>Manage subscription deliveries for fulfillment</p>
                </div>
                <button
                    className="btn-save"
                    onClick={handleGenerateDeliveries}
                    disabled={generateLoading}
                    style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}
                >
                    {generateLoading ? '⏳ Generating...' : '🔄 Generate Deliveries (7 Days)'}
                </button>
            </div>

            <div className="filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                    }}
                />
                <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Times</option>
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    {statuses.map((status) => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading deliveries...</div>
            ) : (
                <>
                    <div style={{ marginBottom: '1rem', color: '#6b7280' }}>
                        Showing {deliveries.length} of {pagination.total} deliveries for {formatDate(selectedDate)}
                    </div>

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Address</th>
                                    <th>Product</th>
                                    <th>Time</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.length > 0 ? (
                                    deliveries.map((delivery) => (
                                        <tr key={delivery._id}>
                                            <td className="name-cell">
                                                {delivery.user_id?.first_name} {delivery.user_id?.last_name}
                                                <br />
                                                <small style={{ color: '#6b7280' }}>{delivery.user_id?.mobile}</small>
                                            </td>
                                            <td>
                                                {delivery.user_id?.address ? (
                                                    <>
                                                        {delivery.user_id.address}
                                                        <br />
                                                        <small style={{ color: '#6b7280' }}>
                                                            {delivery.user_id.city}, {delivery.user_id.pincode}
                                                        </small>
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#9ca3af' }}>No address</span>
                                                )}
                                            </td>
                                            <td>{delivery.product_quantity}</td>
                                            <td style={{ textTransform: 'capitalize' }}>
                                                {delivery.delivery_time === 'morning' ? '🌅 ' : '🌙 '}
                                                {delivery.delivery_time}
                                            </td>
                                            <td className="wallet-cell">₹{delivery.price}</td>
                                            <td>
                                                <span
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(delivery.status) }}
                                                >
                                                    {delivery.status}
                                                </span>
                                            </td>
                                            <td>
                                                {delivery.status === 'scheduled' ? (
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-save"
                                                            onClick={() => handleMarkDelivered(delivery._id)}
                                                            disabled={actionLoading === delivery._id}
                                                            style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
                                                        >
                                                            ✓ Delivered
                                                        </button>
                                                        <button
                                                            className="btn-view"
                                                            onClick={() => handleSkip(delivery._id)}
                                                            disabled={actionLoading === delivery._id}
                                                            style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
                                                        >
                                                            Skip
                                                        </button>
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleMarkMissed(delivery._id)}
                                                            disabled={actionLoading === delivery._id}
                                                            style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
                                                        >
                                                            Missed
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                                                        {delivery.status === 'delivered' && '✓ Wallet charged'}
                                                        {delivery.status === 'skipped' && `Skipped by ${delivery.skipped_by || 'N/A'}`}
                                                        {delivery.status === 'missed' && 'No charge'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            No deliveries found for this date
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                            >
                                Previous
                            </button>
                            <span>
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TodaysDeliveries;
