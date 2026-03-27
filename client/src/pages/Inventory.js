import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch,
  MdInventory,
  MdWarning,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdDownload,
  MdUpload
} from 'react-icons/md';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  
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

  const [stockData, setStockData] = useState({
    quantity: '',
    operation: 'add',
    notes: ''
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

  const onStockChange = (e) => {
    setStockData({ ...stockData, [e.target.name]: e.target.value });
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

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockData({
      quantity: '',
      operation: 'add',
      notes: ''
    });
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setSelectedProduct(null);
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

  const onStockSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`/api/products/${selectedProduct._id}/stock`, {
        quantity: parseInt(stockData.quantity),
        operation: stockData.operation
      });
      
      toast.success('تم تحديث المخزون بنجاح');
      closeStockModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في تحديث المخزون');
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

  const getStockIcon = (product) => {
    if (product.quantity === 0) {
      return <MdWarning style={{ color: '#ea4335' }} />;
    }
    if (product.quantity <= product.minQuantity) {
      return <MdWarning style={{ color: '#fbbc04' }} />;
    }
    return <MdInventory style={{ color: '#34a853' }} />;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'out') matchesStock = product.quantity === 0;
    if (stockFilter === 'low') matchesStock = product.quantity > 0 && product.quantity <= product.minQuantity;
    if (stockFilter === 'available') matchesStock = product.quantity > product.minQuantity;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = [...new Set(products.map(p => p.category))];
  
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة المخزون</h1>
          <p className="page-subtitle">إدارة المنتجات والكميات في المخزون</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <MdDownload />
            <span className="btn-text">تصدير</span>
          </button>
          <button className="btn btn-secondary">
            <MdUpload />
            <span className="btn-text">استيراد</span>
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <MdAdd />
            <span className="btn-text">إضافة منتج</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <MdInventory />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-label">إجمالي المنتجات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalValue.toLocaleString('ar-EG')} ج.م</div>
            <div className="stat-label">قيمة المخزون</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <MdWarning />
          </div>
          <div className="stat-content">
            <div className="stat-value">{lowStock}</div>
            <div className="stat-label">مخزون منخفض</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <MdTrendingDown />
          </div>
          <div className="stat-content">
            <div className="stat-value">{outOfStock}</div>
            <div className="stat-label">نفذ المخزون</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-container">
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
        <div className="filter-group">
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
          <div className="filter-box">
            <select
              className="form-control"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="available">متوفر</option>
              <option value="low">مخزون منخفض</option>
              <option value="out">نفذ المخزون</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="table-container">
          <table className="table inventory-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th className="hide-mobile">رمز المنتج</th>
                <th className="hide-mobile hide-mobile-sm">الفئة</th>
                <th>سعر البيع</th>
                <th className="hide-mobile">سعر التكلفة</th>
                <th>الكمية</th>
                <th className="hide-mobile hide-mobile-sm">الحد الأدنى</th>
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
                          {getStockIcon(product)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>
                            {product.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">{product.sku}</td>
                    <td className="hide-mobile hide-mobile-sm">{product.category}</td>
                    <td>{product.price.toLocaleString('ar-EG')} ج.م</td>
                    <td className="hide-mobile">{product.costPrice ? product.costPrice.toLocaleString('ar-EG') + ' ج.م' : '-'}</td>
                    <td>
                      <span style={{ 
                        fontWeight: '600',
                        color: product.quantity === 0 ? '#ea4335' : 
                               product.quantity <= product.minQuantity ? '#fbbc04' : '#34a853'
                      }}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="hide-mobile hide-mobile-sm">{product.minQuantity}</td>
                    <td>{getStockStatus(product)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn"
                          onClick={() => openStockModal(product)}
                          title="تعديل المخزون"
                          style={{ color: '#1a73e8' }}
                        >
                          <MdInventory />
                        </button>
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
                  <td colSpan="9" className="text-center">
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

      {/* Add/Edit Product Modal */}
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
                <div className="form-grid">
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

                <div className="form-grid">
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

                <div className="form-grid">
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

                <div className="form-grid">
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

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeStockModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">تعديل المخزون</h3>
              <button className="modal-close" onClick={closeStockModal}>×</button>
            </div>
            <form onSubmit={onStockSubmit}>
              <div className="modal-body">
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                    {selectedProduct.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#5f6368' }}>
                    الكمية الحالية: <strong>{selectedProduct.quantity}</strong> {selectedProduct.unit}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">نوع العملية *</label>
                    <select
                      name="operation"
                      className="form-control"
                      value={stockData.operation}
                      onChange={onStockChange}
                      required
                    >
                      <option value="add">إضافة للمخزون</option>
                      <option value="subtract">خصم من المخزون</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">الكمية *</label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-control"
                      value={stockData.quantity}
                      onChange={onStockChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">ملاحظات</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    value={stockData.notes}
                    onChange={onStockChange}
                    rows="3"
                    placeholder="سبب التعديل..."
                  />
                </div>

                {stockData.quantity && (
                  <div style={{ 
                    background: stockData.operation === 'add' ? '#e6f4ea' : '#fce8e6',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      الكمية بعد التعديل:
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                      {stockData.operation === 'add' 
                        ? selectedProduct.quantity + parseInt(stockData.quantity || 0)
                        : selectedProduct.quantity - parseInt(stockData.quantity || 0)
                      } {selectedProduct.unit}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeStockModal}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  تحديث المخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
