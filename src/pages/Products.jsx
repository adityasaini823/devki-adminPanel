import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../redux/slices/productsSlice';
import ImageUpload from '../components/common/ImageUpload';
import './DataTable.css';

const Products = () => {
  const dispatch = useDispatch();
  const { products, pagination, loading, error, actionLoading } = useSelector((state) => state.products);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    dispatch(fetchProducts({ page, limit: 20, search }));
  }, [dispatch, page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleAddNew = () => {
    setIsNew(true);
    setSelectedProduct(null);
    setEditForm({
      product_name: '',
      product_price: '',
      product_image: '',
      product_stock: '',
      category: '',
      description: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setIsNew(false);
    setSelectedProduct(product);
    setEditForm({
      product_name: product.product_name,
      product_price: product.product_price,
      product_image: product.product_image,
      product_stock: product.product_stock,
      category: product.category || '',
      description: product.description || '',
      is_active: product.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (isNew) {
        await dispatch(createProduct(editForm)).unwrap();
        toast.success('Product created successfully');
      } else {
        await dispatch(updateProduct({ id: selectedProduct.id, data: editForm })).unwrap();
        toast.success('Product updated successfully');
      }
      setShowModal(false);
      dispatch(fetchProducts({ page, limit: 20, search }));
    } catch (err) {
      toast.error(err?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete product');
    }
  };

  const toggleActive = async (product) => {
    try {
      await dispatch(updateProduct({ id: product.id, data: { is_active: !product.is_active } })).unwrap();
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'}`);
      dispatch(fetchProducts({ page, limit: 20, search }));
    } catch (err) {
      toast.error(err?.message || 'Failed to update product status');
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
        <h1>📦 Products</h1>
        <p>Manage your product catalog</p>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
        <button className="btn-add" onClick={handleAddNew}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
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
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
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
                          src={product.product_image}
                          alt={product.product_name}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/48';
                          }}
                        />
                      </td>
                      <td className="name-cell">{product.product_name}</td>
                      <td>{formatCurrency(product.product_price)}</td>
                      <td>{product.product_stock}</td>
                      <td>{product.category || '-'}</td>
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
                      No products found
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isNew ? 'Add New Product' : 'Edit Product'}</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={editForm.product_name}
                  onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  value={editForm.product_price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, product_price: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  value={editForm.product_stock}
                  onChange={(e) =>
                    setEditForm({ ...editForm, product_stock: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Product Image *</label>
                <ImageUpload
                  initialImage={editForm.product_image}
                  onUploadComplete={(url) => setEditForm({ ...editForm, product_image: url })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
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
                {actionLoading ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
