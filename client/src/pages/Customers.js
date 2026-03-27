import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch,
  MdPeople,
  MdPhone,
  MdEmail
} from 'react-icons/md';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    customerType: 'individual',
    address: {
      street: '',
      city: '',
      governorate: ''
    },
    creditLimit: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data.data);
    } catch (err) {
      toast.error('خطأ في جلب العملاء');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      customerType: 'individual',
      address: {
        street: '',
        city: '',
        governorate: ''
      },
      creditLimit: '',
      notes: ''
    });
    setEditingCustomer(null);
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        customerType: customer.customerType || 'individual',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          governorate: customer.address?.governorate || ''
        },
        creditLimit: customer.creditLimit?.toString() || '',
        notes: customer.notes || ''
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
      const customerData = {
        ...formData,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined
      };

      if (editingCustomer) {
        await axios.put(`/api/customers/${editingCustomer._id}`, customerData);
        toast.success('تم تحديث العميل بنجاح');
      } else {
        await axios.post('/api/customers', customerData);
        toast.success('تم إضافة العميل بنجاح');
      }
      
      closeModal();
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في حفظ العميل');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      return;
    }

    try {
      await axios.delete(`/api/customers/${id}`);
      toast.success('تم حذف العميل بنجاح');
      fetchCustomers();
    } catch (err) {
      toast.error('خطأ في حذف العميل');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !typeFilter || customer.customerType === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة العملاء</h1>
          <p className="page-subtitle">إدارة بيانات العملاء والحسابات</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <MdAdd />
          إضافة عميل جديد
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter">
        <div className="search-box">
          <MdSearch />
          <input
            type="text"
            className="form-control"
            placeholder="البحث عن عميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">جميع الأنواع</option>
            <option value="individual">فرد</option>
            <option value="company">شركة</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>الهاتف</th>
                <th>النوع</th>
                <th>الرصيد</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%',
                          background: '#e8f0fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <MdPeople style={{ color: '#1a73e8' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{customer.name}</div>
                          {customer.email && (
                            <div style={{ fontSize: '0.75rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MdEmail style={{ fontSize: '0.875rem' }} />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdPhone style={{ color: '#5f6368' }} />
                        {customer.phone}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${customer.customerType === 'company' ? 'badge-info' : 'badge-success'}`}>
                        {customer.customerType === 'company' ? 'شركة' : 'فرد'}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        color: customer.currentBalance > 0 ? '#ea4335' : '#34a853',
                        fontWeight: '500'
                      }}>
                        {customer.currentBalance.toLocaleString('ar-EG')} ج.م
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${customer.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {customer.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn"
                          onClick={() => openModal(customer)}
                          title="تعديل"
                        >
                          <MdEdit />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(customer._id)}
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
                  <td colSpan="6" className="text-center">
                    <div className="empty-state">
                      <MdPeople />
                      <h3>لا يوجد عملاء</h3>
                      <p>ابدأ بإضافة عميل جديد</p>
                      <button className="btn btn-primary" onClick={() => openModal()}>
                        <MdAdd />
                        إضافة عميل
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
                {editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
              </h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="modal-body">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">اسم العميل *</label>
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
                    <label className="form-label">رقم الهاتف *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">نوع العميل</label>
                    <select
                      name="customerType"
                      className="form-control"
                      value={formData.customerType}
                      onChange={onChange}
                    >
                      <option value="individual">فرد</option>
                      <option value="company">شركة</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">الشارع</label>
                    <input
                      type="text"
                      name="address.street"
                      className="form-control"
                      value={formData.address.street}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">المدينة</label>
                    <input
                      type="text"
                      name="address.city"
                      className="form-control"
                      value={formData.address.city}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">المحافظة</label>
                    <input
                      type="text"
                      name="address.governorate"
                      className="form-control"
                      value={formData.address.governorate}
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">حد الائتمان</label>
                  <input
                    type="number"
                    name="creditLimit"
                    className="form-control"
                    value={formData.creditLimit}
                    onChange={onChange}
                    min="0"
                    step="0.01"
                  />
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
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
