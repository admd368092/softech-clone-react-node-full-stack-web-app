import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MdAdd, 
  MdDelete, 
  MdShoppingCart,
  MdPerson,
  MdInventory
} from 'react-icons/md';

const NewSale = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customer: '',
    items: [{ product: '', quantity: 1, unitPrice: 0, discount: 0 }],
    discount: 0,
    tax: 0,
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/products')
      ]);
      setCustomers(customersRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Update unit price when product changes
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        newItems[index].unitPrice = selectedProduct.price;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, unitPrice: 0, discount: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
      return sum + itemTotal;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (formData.discount || 0) + (formData.tax || 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validate items
    const hasInvalidItems = formData.items.some(item => !item.product || item.quantity < 1);
    if (hasInvalidItems) {
      toast.error('يرجى التأكد من اختيار المنتجات والكميات');
      return;
    }

    setSubmitting(true);

    try {
      const saleData = {
        customer: formData.customer,
        items: formData.items.map(item => ({
          product: item.product,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          discount: parseFloat(item.discount) || 0
        })),
        discount: parseFloat(formData.discount) || 0,
        tax: parseFloat(formData.tax) || 0,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      await axios.post('/api/sales', saleData);
      toast.success('تم إنشاء الفاتورة بنجاح');
      navigate('/sales');
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الفاتورة');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="new-sale-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">فاتورة جديدة</h1>
          <p className="page-subtitle">إنشاء فاتورة مبيعات جديدة</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-2">
          {/* Customer Selection */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <MdPerson style={{ marginLeft: '8px' }} />
                بيانات العميل
              </h3>
            </div>
            <div className="form-group">
              <label className="form-label">العميل *</label>
              <select
                name="customer"
                className="form-control"
                value={formData.customer}
                onChange={onChange}
                required
              >
                <option value="">اختر العميل</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">طريقة الدفع</label>
              <select
                name="paymentMethod"
                className="form-control"
                value={formData.paymentMethod}
                onChange={onChange}
              >
                <option value="cash">نقداً</option>
                <option value="card">بطاقة</option>
                <option value="transfer">تحويل</option>
                <option value="credit">آجل</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={onChange}
                rows="3"
              />
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <MdShoppingCart style={{ marginLeft: '8px' }} />
                ملخص الفاتورة
              </h3>
            </div>
            <div style={{ padding: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>المجموع الفرعي:</span>
                <span style={{ fontWeight: '500' }}>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>الخصم:</span>
                <input
                  type="number"
                  name="discount"
                  className="form-control"
                  value={formData.discount}
                  onChange={onChange}
                  min="0"
                  step="0.01"
                  style={{ width: '120px', textAlign: 'left' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>الضريبة:</span>
                <input
                  type="number"
                  name="tax"
                  className="form-control"
                  value={formData.tax}
                  onChange={onChange}
                  min="0"
                  step="0.01"
                  style={{ width: '120px', textAlign: 'left' }}
                />
              </div>
              <hr style={{ margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700' }}>
                <span>الإجمالي:</span>
                <span style={{ color: '#1a73e8' }}>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MdInventory style={{ marginLeft: '8px' }} />
              المنتجات
            </h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              <MdAdd />
              إضافة منتج
            </button>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>الخصم</th>
                  <th>الإجمالي</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => {
                  const itemTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
                  return (
                    <tr key={index}>
                      <td>
                        <select
                          className="form-control"
                          value={item.product}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          required
                        >
                          <option value="">اختر المنتج</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name} - {product.quantity} متوفر
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          required
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                          style={{ width: '100px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          min="0"
                          step="0.01"
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td style={{ fontWeight: '500' }}>
                        {formatCurrency(itemTotal)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="action-btn delete"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/sales')}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
          >
            {submitting ? 'جاري الإنشاء...' : 'إنشاء الفاتورة'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewSale;
