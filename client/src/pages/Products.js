import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch,
  MdFilterList,
  MdInventory
} from 'react-icons/md';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    costPrice: '',
    quantity: '',
    minQuantity: '',
    unit: 'قطعة',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.data);
    } catch (err) {
      toast.error('خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      costPrice: '',
      quantity: '',
      minQuantity: '',
      unit: 'قطعة',
      description: ''
    });
    setEditingProduct(null);
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || '',
        quantity: product.quantity.toString(),
        minQuantity: product.minQuantity?.toString() || '',
        unit: product.unit || 'قطعة',
        description: product.description || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        quantity: parseInt(formData.quantity),
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await axios.post('/api/products', productData);
        toast.success('تم إضافة المنتج بنجاح');
      }
      
      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في حفظ المنتج');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      return;
    }

    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (err) {
      toast.error('خطأ في حذف المنتج');
    }
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) {
      return <span className="badge badge-danger">نفذ المخزون</span>;
    }
    if (product.quantity <= product.minQuantity) {
      return <span className="badge badge-warning">مخزون منخفض</span>;
    }
    return <span className="badge badge-success">متوفر</span>;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة المنتجات</h1>
          <p className="page-subtitle">إدارة مخزون المنتجات والكميات</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <MdAdd />
          إضافة منتج جديد
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter">
        <div className="search-box">
          <MdSearch />
          <input
            type="text"
            className="form-control"
            placeholder="البحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">جميع الفئات</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>اسم المنتج</th>
                <th>رمز المنتج</th>
                <th>الفئة</th>
                <th>السعر</th>
                <th>الكمية</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '8px',
                          background: '#e8f0fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <MdInventory style={{ color: '#1a73e8' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>
                            {product.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>{product.price.toLocaleString('ar-EG')} ج.م</td>
                    <td>{product.quantity}</td>
                    <td>{getStockStatus(product)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn"
                          onClick={() => openModal(product)}
                          title="تعديل"
                        >
                          <MdEdit />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(product._id)}
                          title="حذف"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <MdInventory />
                      <h3>لا توجد منتجات</h3>
                      <p>ابدأ بإضافة منتج جديد</p>
                      <button className="btn btn-primary" onClick={() => openModal()}>
                        <MdAdd />
                        إضافة منتج
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="modal-body">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">اسم المنتج *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">رمز المنتج (SKU) *</label>
                    <input
                      type="text"
                      name="sku"
                      className="form-control"
                      value={formData.sku}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">الفئة *</label>
                    <input
                      type="text"
                      name="category"
                      className="form-control"
                      value={formData.category}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الوحدة</label>
                    <input
                      type="text"
                      name="unit"
                      className="form-control"
                      value={formData.unit}
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">سعر البيع *</label>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      value={formData.price}
                      onChange={onChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">سعر التكلفة</label>
                    <input
                      type="number"
                      name="costPrice"
                      className="form-control"
                      value={formData.costPrice}
                      onChange={onChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">الكمية الحالية *</label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-control"
                      value={formData.quantity}
                      onChange={onChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الحد الأدنى للكمية</label>
                    <input
                      type="number"
                      name="minQuantity"
                      className="form-control"
                      value={formData.minQuantity}
                      onChange={onChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">الوصف</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={onChange}
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
