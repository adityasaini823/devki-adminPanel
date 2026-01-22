import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    fetchSubscriptionProducts,
    createSubscriptionProduct,
    updateSubscriptionProduct,
    deleteSubscriptionProduct,
} from '../redux/slices/subscriptionProductsSlice';
import ImageUpload from '../components/common/ImageUpload';
import './DataTable.css';

const SubscriptionProducts = () => {
    const dispatch = useDispatch();
    const { products, loading, error, actionLoading } = useSelector((state) => state.subscriptionProducts);
    const [showModal, setShowModal] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        dispatch(fetchSubscriptionProducts());
    }, [dispatch]);

    const handleAddNew = () => {
        setIsNew(true);
        setEditForm({
            name: '',
            quantity: '',
            price_per_unit: '',
            price_per_delivery: '',
            image: '',
            description: '',
            is_active: true,
        });
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setIsNew(false);
        setEditForm({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            price_per_unit: product.price_per_unit,
            price_per_delivery: product.price_per_delivery,
            image: product.image,
            description: product.description || '',
            is_active: product.is_active,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (!editForm.quantity || !editForm.price_per_delivery) {
                toast.error("Quantity and Price per Delivery are required");
                return;
            }

            if (isNew) {
                await dispatch(createSubscriptionProduct(editForm)).unwrap();
                toast.success('Plan created successfully');
            } else {
                await dispatch(updateSubscriptionProduct({ id: editForm.id, data: editForm })).unwrap();
                toast.success('Plan updated successfully');
            }
            setShowModal(false);
            // fetchSubscriptionProducts is handled by reducer but good to refresh if needed
        } catch (err) {
            toast.error(err?.message || 'Failed to save plan');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            await dispatch(deleteSubscriptionProduct(id)).unwrap();
            toast.success('Plan deleted successfully');
        } catch (err) {
            toast.error(err?.message || 'Failed to delete plan');
        }
    };

    const toggleActive = async (product) => {
        try {
            await dispatch(updateSubscriptionProduct({ id: product.id, data: { is_active: !product.is_active } })).unwrap();
            toast.success(`Plan ${product.is_active ? 'deactivated' : 'activated'}`);
        } catch (err) {
            toast.error(err?.message || 'Failed to update plan status');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <div className="data-page">
            <div className="page-header">
                <h1>🥛 Milk Plans</h1>
                <p>Manage subscription quantities and prices</p>
            </div>

            <div className="filters">
                <div className="spacer"></div>
                <button className="btn-add" onClick={handleAddNew}>
                    + Add Plan
                </button>
            </div>

            {loading && products.length === 0 ? (
                <div className="loading">Loading plans...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Price / Delivery</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/48';
                                                    }}
                                                />
                                            </td>
                                            <td className="name-cell">{product.name}</td>
                                            <td>{product.quantity}</td>
                                            <td className="wallet-cell">{formatCurrency(product.price_per_delivery)}</td>
                                            <td>
                                                <span
                                                    className="status-badge"
                                                    style={{ backgroundColor: product.is_active ? '#10b981' : '#6b7280' }}
                                                >
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-edit" onClick={() => handleEdit(product)}>
                                                        Edit
                                                    </button>
                                                    <button className="btn-view" onClick={() => toggleActive(product)}>
                                                        {product.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button className="btn-delete" onClick={() => handleDelete(product.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            No plans found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{isNew ? 'Add New Plan' : 'Edit Plan'}</h2>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Plan Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Pure Cow Milk (1L)"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantity (e.g. "500 ml", "1 L") *</label>
                                <input
                                    type="text"
                                    placeholder="500 ml"
                                    value={editForm.quantity}
                                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Price Per Delivery (₹) *</label>
                                <input
                                    type="number"
                                    placeholder="40"
                                    value={editForm.price_per_delivery}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, price_per_delivery: parseFloat(e.target.value) })
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Image *</label>
                                <ImageUpload
                                    initialImage={editForm.image}
                                    onUploadComplete={(url) => setEditForm({ ...editForm, image: url })}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleSave} disabled={actionLoading}>
                                {actionLoading ? 'Saving...' : isNew ? 'Create Plan' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionProducts;
