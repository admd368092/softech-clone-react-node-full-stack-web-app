import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdBusiness, MdEmail, MdLock, MdPerson, MdPhone } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, phone } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);

    const result = await register({
      name,
      email,
      password,
      phone
    });
    
    if (result.success) {
      toast.success('تم إنشاء الحساب بنجاح');
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
          <p className="login-subtitle">إنشاء حساب جديد</p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">الاسم الكامل</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="أدخل الاسم الكامل"
                value={name}
                onChange={onChange}
                required
                style={{ paddingRight: '44px' }}
              />
              <MdPerson 
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
            <label className="form-label">رقم الهاتف</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="أدخل رقم الهاتف"
                value={phone}
                onChange={onChange}
                style={{ paddingRight: '44px' }}
              />
              <MdPhone 
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
                minLength="6"
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

          <div className="form-group">
            <label className="form-label">تأكيد كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="أعد إدخال كلمة المرور"
                value={confirmPassword}
                onChange={onChange}
                required
                minLength="6"
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
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            لديك حساب بالفعل؟{' '}
            <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
