import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MdAssessment, 
  MdShoppingCart, 
  MdPeople, 
  MdInventory,
  MdAttachMoney,
  MdTrendingUp,
  MdDownload
} from 'react-icons/md';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState(null);
  const [categorySales, setCategorySales] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const [statsRes, chartRes, categoryRes, customersRes, productsRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/sales-chart'),
        axios.get('/api/dashboard/category-sales'),
        axios.get('/api/dashboard/top-customers'),
        axios.get('/api/dashboard/top-products')
      ]);

      setStats(statsRes.data.data);
      setSalesChart(chartRes.data.data);
      setCategorySales(categoryRes.data.data);
      setTopCustomers(customersRes.data.data);
      setTopProducts(productsRes.data.data);
    } catch (err) {
      toast.error('خطأ في جلب التقارير');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const lineChartData = {
    labels: salesChart?.labels || [],
    datasets: [
      {
        label: 'المبيعات',
        data: salesChart?.data || [],
        borderColor: '#1a73e8',
        backgroundColor: 'rgba(26, 115, 232, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('ar-EG');
          }
        }
      }
    }
  };

  const categoryChartData = {
    labels: categorySales.map(cat => cat._id),
    datasets: [
      {
        label: 'المبيعات',
        data: categorySales.map(cat => cat.totalSales),
        backgroundColor: [
          '#1a73e8',
          '#34a853',
          '#fbbc04',
          '#ea4335',
          '#9334e6',
          '#00bcd4',
          '#ff9800',
          '#795548'
        ],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('ar-EG');
          }
        }
      }
    }
  };

  const paymentMethodData = {
    labels: ['نقداً', 'بطاقة', 'تحويل', 'آجل'],
    datasets: [
      {
        data: [
          stats?.salesByPaymentMethod?.find(s => s._id === 'cash')?.total || 0,
          stats?.salesByPaymentMethod?.find(s => s._id === 'card')?.total || 0,
          stats?.salesByPaymentMethod?.find(s => s._id === 'transfer')?.total || 0,
          stats?.salesByPaymentMethod?.find(s => s._id === 'credit')?.total || 0
        ],
        backgroundColor: ['#34a853', '#1a73e8', '#fbbc04', '#ea4335'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">التقارير والتحليلات</h1>
          <p className="page-subtitle">عرض تقارير الأداء والمبيعات</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="form-control"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="year">آخر سنة</option>
          </select>
          <button className="btn btn-secondary">
            <MdDownload />
            تصدير
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <MdShoppingCart />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalSales || 0}</div>
            <div className="stat-label">إجمالي المبيعات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <MdAttachMoney />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <div className="stat-label">إجمالي الإيرادات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <MdPeople />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalCustomers || 0}</div>
            <div className="stat-label">إجمالي العملاء</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <MdInventory />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalProducts || 0}</div>
            <div className="stat-label">إجمالي المنتجات</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MdTrendingUp style={{ marginLeft: '8px' }} />
              المبيعات خلال الأسبوع
            </h3>
          </div>
          <div className="chart-container">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MdAssessment style={{ marginLeft: '8px' }} />
              المبيعات حسب الفئة
            </h3>
          </div>
          <div className="chart-container">
            <Bar data={categoryChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">توزيع طرق الدفع</h3>
          </div>
          <div className="chart-container">
            <Doughnut data={paymentMethodData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ملخص الأداء</h3>
          </div>
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #dadce0' }}>
              <span>المبيعات المدفوعة:</span>
              <span style={{ fontWeight: '600', color: '#34a853' }}>{stats?.paidSales || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #dadce0' }}>
              <span>المبيعات المعلقة:</span>
              <span style={{ fontWeight: '600', color: '#fbbc04' }}>{stats?.pendingSales || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #dadce0' }}>
              <span>المبالغ المعلقة:</span>
              <span style={{ fontWeight: '600', color: '#ea4335' }}>{formatCurrency(stats?.pendingPayments || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>منتجات منخفضة المخزون:</span>
              <span style={{ fontWeight: '600', color: '#ea4335' }}>{stats?.lowStockProducts || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MdPeople style={{ marginLeft: '8px' }} />
              أفضل العملاء
            </h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>عدد الطلبات</th>
                  <th>إجمالي المشتريات</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.length > 0 ? (
                  topCustomers.map((customer, index) => (
                    <tr key={index}>
                      <td>{customer.customerName}</td>
                      <td>{customer.totalOrders}</td>
                      <td style={{ fontWeight: '500' }}>{formatCurrency(customer.totalPurchases)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">لا توجد بيانات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MdInventory style={{ marginLeft: '8px' }} />
              أفضل المنتجات
            </h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية المباعة</th>
                  <th>الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>{product.productName}</td>
                      <td>{product.totalQuantity}</td>
                      <td style={{ fontWeight: '500' }}>{formatCurrency(product.totalRevenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">لا توجد بيانات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
