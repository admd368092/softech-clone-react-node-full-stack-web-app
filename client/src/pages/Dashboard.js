import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MdShoppingCart, 
  MdPeople, 
  MdInventory, 
  MdAttachMoney,
  MdTrendingUp,
  MdWarning
} from 'react-icons/md';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesChart, setSalesChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes, productsRes, chartRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/recent-sales'),
        axios.get('/api/dashboard/top-products'),
        axios.get('/api/dashboard/sales-chart')
      ]);

      setStats(statsRes.data.data);
      setRecentSales(salesRes.data.data);
      setTopProducts(productsRes.data.data);
      setSalesChart(chartRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

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

  const doughnutData = {
    labels: ['مدفوع', 'معلق', 'ملغي'],
    datasets: [
      {
        data: [
          stats?.paidSales || 0,
          stats?.pendingSales || 0,
          (stats?.totalSales || 0) - (stats?.paidSales || 0) - (stats?.pendingSales || 0)
        ],
        backgroundColor: ['#34a853', '#fbbc04', '#ea4335'],
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

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">لوحة التحكم</h1>
          <p className="page-subtitle">مرحباً بك في نظام إدارة الأعمال الذكي</p>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Charts Row */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">المبيعات خلال الأسبوع</h3>
          </div>
          <div className="chart-container">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">حالة المبيعات</h3>
          </div>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent Sales & Top Products */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">آخر المبيعات</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>العميل</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.invoiceNumber}</td>
                      <td>{sale.customerName}</td>
                      <td>{formatCurrency(sale.total)}</td>
                      <td>{formatDate(sale.saleDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">لا توجد مبيعات حديثة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">أفضل المنتجات مبيعاً</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>{product.productName}</td>
                      <td>{product.totalQuantity}</td>
                      <td>{formatCurrency(product.totalRevenue)}</td>
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

      {/* Alerts */}
      {stats?.lowStockProducts > 0 && (
        <div className="card" style={{ borderRight: '4px solid #ea4335' }}>
          <div className="flex-between">
            <div className="flex gap-2">
              <MdWarning style={{ color: '#ea4335', fontSize: '1.5rem' }} />
              <div>
                <h4 style={{ marginBottom: '4px' }}>تنبيه: منتجات منخفضة المخزون</h4>
                <p style={{ color: '#5f6368', fontSize: '0.875rem' }}>
                  يوجد {stats.lowStockProducts} منتج بحاجة إلى إعادة تعبئة
                </p>
              </div>
            </div>
            <button className="btn btn-danger btn-sm">عرض المنتجات</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
