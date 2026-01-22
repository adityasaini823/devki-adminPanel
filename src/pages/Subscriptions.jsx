import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { fetchSubscriptions, updateSubscriptionStatus } from '../redux/slices/subscriptionsSlice';
import './DataTable.css';

const Subscriptions = () => {
  const dispatch = useDispatch();
  const { subscriptions, pagination, loading, error } = useSelector((state) => state.subscriptions);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchSubscriptions({ page, limit: 20, status: statusFilter }));
  }, [dispatch, page, statusFilter]);

  const handleStatusChange = async (subscriptionId, newStatus) => {
    try {
      await dispatch(updateSubscriptionStatus({ id: subscriptionId, status: newStatus })).unwrap();
      toast.success(`Subscription status updated to ${newStatus}`);
      dispatch(fetchSubscriptions({ page, limit: 20, status: statusFilter }));
    } catch (err) {
      toast.error(err?.message || 'Failed to update subscription status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
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
      active: '#10b981',
      paused: '#f59e0b',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const subscriptionStatuses = ['active', 'paused', 'cancelled'];

  return (
    <div className="data-page">
      <div className="page-header">
        <h1>🔄 Subscriptions</h1>
        <p>Manage customer subscriptions</p>
      </div>

      <div className="filters">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {subscriptionStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading subscriptions...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Frequency</th>
                  <th>Delivery Time</th>
                  <th>Monthly Est.</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length > 0 ? (
                  subscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="name-cell">
                        {sub.user?.name || 'N/A'}
                        <br />
                        <small style={{ color: '#6b7280' }}>{sub.user?.mobile}</small>
                      </td>
                      <td>
                        {sub.product?.name || 'N/A'}
                        <br />
                        <small style={{ color: '#6b7280' }}>{sub.product?.quantity}</small>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{sub.frequency}</td>
                      <td style={{ textTransform: 'capitalize' }}>{sub.delivery_time}</td>
                      <td className="wallet-cell">{formatCurrency(sub.monthly_estimate)}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(sub.status) }}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td>{formatDate(sub.start_date)}</td>
                      <td>
                        <select
                          value={sub.status}
                          onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                          style={{
                            padding: '0.375rem 0.5rem',
                            borderRadius: 6,
                            border: '1px solid #d1d5db',
                            fontSize: '0.75rem',
                          }}
                        >
                          {subscriptionStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No subscriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {pagination.pages || 1}
            </span>
            <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Subscriptions;
