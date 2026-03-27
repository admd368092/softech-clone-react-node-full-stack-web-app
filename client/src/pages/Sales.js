import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MdAdd, 
  MdVisibility, 
  MdDelete, 
  MdSearch,
  MdShoppingCart,
  MdPrint,
  MdFilterList
} from 'react-icons/md';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get('/api/sales');
      setSales(res.data.data);
    } catch (err) {
      toast.error('خطأ في جلب المبيعات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      return;
    }

    try {
      await axios.delete(`/api/sales/${id}`);
      toast.success('تم حذف الفاتورة بنجاح');
      fetchSales();
    } catch (err) {
      toast.error('خطأ في حذف الفاتورة');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { label: 'مدفوع', class: 'badge-success' },
      pending: { label: 'معلق', class: 'badge-warning' },
      partial: { label: 'جزئي', class: 'badge-info' },
      cancelled: { label: 'ملغي', class: 'badge-danger' }
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      cash: 'نقداً',
      card: 'بطاقة',
      transfer: 'تحويل',
      credit: 'آجل'
    };
    return methodMap[method] || method;
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || sale.paymentStatus === statusFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const saleDate = new Date(sale.saleDate).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      matchesDate = saleDate === filterDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة المبيعات</h1>
          <p className="page-subtitle">عرض وإدارة جميع الفواتير</p>
        </div>
        <Link to="/sales/new" className="btn btn-primary">
          <MdAdd />
          فاتورة جديدة
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon primary">
            <MdShoppingCart />
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredSales.length}</div>
            <div className="stat-label">عدد الفواتير</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <MdShoppingCart />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
            <div className="stat-label">إجمالي المبيعات</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter">
        <div className="search-box">
          <MdSearch />
          <input
            type="text"
            className="form-control"
            placeholder="البحث برقم الفاتورة أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">جميع الحالات</option>
            <option value="paid">مدفوع</option>
            <option value="pending">معلق</option>
            <option value="partial">جزئي</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <div className="filter-box">
          <input
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>العميل</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>طريقة الدفع</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale._id}>
                    <td>
                      <div style={{ fontWeight: '500', color: '#1a73e8' }}>
                        {sale.invoiceNumber}
                      </div>
                    </td>
                    <td>{sale.customerName}</td>
                    <td>{formatDate(sale.saleDate)}</td>
                    <td style={{ fontWeight: '500' }}>
                      {formatCurrency(sale.total)}
                    </td>
                    <td>{getPaymentMethodLabel(sale.paymentMethod)}</td>
                    <td>{getStatusBadge(sale.paymentStatus)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/sales/${sale._id}`}
                          className="action-btn"
                          title="عرض"
                        >
                          <MdVisibility />
                        </Link>
                        <button 
                          className="action-btn"
                          title="طباعة"
                        >
                          <MdPrint />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(sale._id)}
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
                      <MdShoppingCart />
                      <h3>لا توجد فواتير</h3>
                      <p>ابدأ بإنشاء فاتورة جديدة</p>
                      <Link to="/sales/new" className="btn btn-primary">
                        <MdAdd />
                        فاتورة جديدة
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
