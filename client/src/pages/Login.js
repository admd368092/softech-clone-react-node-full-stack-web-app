import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdBusiness, MdEmail, MdLock } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <MdBusiness />
          </div>
          <h1 className="login-title">سوفتك</h1>
          <p className="login-subtitle">نظام إدارة الأعمال الذكي</p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="أدخل البريد الإلكتروني"
                value={email}
                onChange={onChange}
                required
                style={{ paddingRight: '44px' }}
              />
              <MdEmail 
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#5f6368'
                }} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={onChange}
                required
                style={{ paddingRight: '44px' }}
              />
              <MdLock 
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#5f6368'
                }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ليس لديك حساب؟{' '}
            <Link to="/register">إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
