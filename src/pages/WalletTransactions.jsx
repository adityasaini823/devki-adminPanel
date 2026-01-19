import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWalletTransactions, updateWalletTransactionStatus } from '../redux/slices/walletSlice';
import './DataTable.css';

const WalletTransactions = () => {
  const dispatch = useDispatch();
  const { transactions, pagination, loading, error, updateLoading } = useSelector(
    (state) => state.wallet
  );
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', admin_remarks: '' });

  useEffect(() => {
    dispatch(
      fetchWalletTransactions({
        page,
        limit: 20,
        status: statusFilter,
        transaction_type: typeFilter,
      })
    );
  }, [dispatch, page, statusFilter, typeFilter]);

  const handleProcess = (transaction) => {
    setSelectedTransaction(transaction);
    setUpdateForm({ status: transaction.status, admin_remarks: transaction.admin_remarks || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    await dispatch(
      updateWalletTransactionStatus({
        id: selectedTransaction.id,
        status: updateForm.status,
        admin_remarks: updateForm.admin_remarks,
      })
    );
    setShowModal(false);
    dispatch(
      fetchWalletTransactions({
        page,
        limit: 20,
        status: statusFilter,
        transaction_type: typeFilter,
      })
    );
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
      completed: '#10b981',
      rejected: '#ef4444',
      cancelled: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getTypeColor = (type) => {
    return type === 'deposit' ? '#10b981' : '#ef4444';
  };

  const transactionStatuses = ['pending', 'completed', 'rejected', 'cancelled'];
  const transactionTypes = ['deposit', 'withdrawal'];

  return (
    <div className="data-page">
      <div className="page-header">
        <h1>💰 Wallet Transactions</h1>
        <p>Manage wallet deposits and withdrawals</p>
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
          {transactionStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Types</option>
          {transactionTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading transactions...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className="name-cell">
                        {txn.user?.name || 'N/A'}
                        <br />
                        <small style={{ color: '#6b7280' }}>{txn.user?.mobile}</small>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getTypeColor(txn.transaction_type) }}
                        >
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className="wallet-cell">{formatCurrency(txn.amount)}</td>
                      <td style={{ textTransform: 'uppercase' }}>{txn.payment_method || '-'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(txn.status) }}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td>{formatDate(txn.createdAt)}</td>
                      <td>
                        <button className="btn-edit" onClick={() => handleProcess(txn)}>
                          {txn.status === 'pending' ? 'Process' : 'Update'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No transactions found
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

      {showModal && selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Process Transaction</h2>

            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: 8,
              }}
            >
              <p>
                <strong>Customer:</strong> {selectedTransaction.user?.name}
              </p>
              <p>
                <strong>Type:</strong> {selectedTransaction.transaction_type}
              </p>
              <p>
                <strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}
              </p>
              <p>
                <strong>Payment Method:</strong> {selectedTransaction.payment_method || 'N/A'}
              </p>
              {selectedTransaction.payment_id && (
                <p>
                  <strong>Payment ID:</strong> {selectedTransaction.payment_id}
                </p>
              )}
              {selectedTransaction.bank_account?.account_number && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p>
                    <strong>Bank Account:</strong>
                  </p>
                  <p>Account: {selectedTransaction.bank_account.account_number}</p>
                  <p>IFSC: {selectedTransaction.bank_account.ifsc_code}</p>
                  <p>Holder: {selectedTransaction.bank_account.account_holder_name}</p>
                </div>
              )}
              {selectedTransaction.remarks && (
                <p>
                  <strong>User Remarks:</strong> {selectedTransaction.remarks}
                </p>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                >
                  {transactionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Admin Remarks</label>
                <textarea
                  value={updateForm.admin_remarks}
                  onChange={(e) => setUpdateForm({ ...updateForm, admin_remarks: e.target.value })}
                  placeholder="Add remarks (optional)"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave} disabled={updateLoading}>
                {updateLoading ? 'Updating...' : 'Update Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTransactions;
