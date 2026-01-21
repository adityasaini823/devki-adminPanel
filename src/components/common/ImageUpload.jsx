import React, { useState } from 'react';
import api from '../../config/axios';
import './ImageUpload.css';

const ImageUpload = ({ onUploadComplete, initialImage, folder = 'devki/products' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialImage || '');
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Pass the folder in the query string
      const response = await api.post(`/api/admin/upload?folder=${folder}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const imageUrl = response.data.data.url;
        setPreview(imageUrl);
        onUploadComplete(imageUrl);
      } else {
        setError(response.data.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading image');
      console.error('Upload Error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <div className="image-preview">
        {preview ? (
          <img src={preview} alt="Preview" />
        ) : (
          <div className="no-image">No Image Select</div>
        )}
        {uploading && <div className="upload-overlay">Uploading...</div>}
      </div>
      
      <div className="upload-controls">
        <input 
          type="file" 
          id="file-input" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="btn-upload">
          {uploading ? 'Uploading...' : 'Choose Image'}
        </label>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUpload;
