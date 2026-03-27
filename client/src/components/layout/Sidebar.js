import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdInventory, 
  MdPeople, 
  MdShoppingCart, 
  MdAssessment,
  MdAdd,
  MdBusiness
} from 'react-icons/md';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: <MdDashboard />,
      label: 'لوحة التحكم'
    },
    {
      path: '/products',
      icon: <MdInventory />,
      label: 'المنتجات'
    },
    {
      path: '/customers',
      icon: <MdPeople />,
      label: 'العملاء'
    },
    {
      path: '/sales',
      icon: <MdShoppingCart />,
      label: 'المبيعات'
    },
    {
      path: '/sales/new',
      icon: <MdAdd />,
      label: 'فاتورة جديدة'
    },
    {
      path: '/reports',
      icon: <MdAssessment />,
      label: 'التقارير'
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <MdBusiness />
          <div>
            <h1>سوفتك</h1>
            <span>نظام إدارة الأعمال</span>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''}`
            }
            onClick={() => window.innerWidth <= 1024 && setIsOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
