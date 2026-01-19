import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../redux/slices/ordersSlice';
import './DataTable.css';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector((state) => state.orders);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders({ page, limit: 20, status: statusFilter }));
  }, [dispatch, page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    await dispatch(updateOrderStatus({ id: orderId, order_status: newStatus }));
    dispatch(fetchOrders({ page, limit: 20, status: statusFilter }));
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#6366f1',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="data-page">
      <div className="page-header">
        <h1>🛒 Orders</h1>
        <p>Manage customer orders</p>
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
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="name-cell">{order.order_number}</td>
                      <td>
                        {order.user?.name || 'N/A'}
                        <br />
                        <small style={{ color: '#6b7280' }}>{order.user?.mobile}</small>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td className="wallet-cell">{formatCurrency(order.total_amount)}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor:
                              order.payment_status === 'completed' ? '#10b981' : '#f59e0b',
                          }}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={order.order_status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '0.375rem 0.5rem',
                            borderRadius: 6,
                            border: '1px solid #d1d5db',
                            backgroundColor: getStatusColor(order.order_status),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewDetails(order)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No orders found
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

      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Order Details - {selectedOrder.order_number}</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Customer Info</h4>
              <p>
                <strong>Name:</strong> {selectedOrder.user?.name}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedOrder.user?.mobile}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Delivery Address</h4>
              <p>
                {selectedOrder.delivery_address?.address}, {selectedOrder.delivery_address?.city}
                <br />
                {selectedOrder.delivery_address?.state} - {selectedOrder.delivery_address?.pincode}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Order Items</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Product</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.5rem' }}>{item.product_name}</td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                        {formatCurrency(item.product_price)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan="3"
                      style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 600 }}
                    >
                      Total:
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        padding: '0.5rem',
                        fontWeight: 600,
                        color: '#059669',
                      }}
                    >
                      {formatCurrency(selectedOrder.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
