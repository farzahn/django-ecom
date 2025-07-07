import React, { useState, useEffect } from 'react';
import { customerAPI, authAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/useStore';
import { Customer } from '../../../types';

const ProfileManagement: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [userFormData, setUserFormData] = useState({
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const { setUser } = useAuthStore();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await customerAPI.getCustomer();
        setCustomer(response.data);
        setFormData(response.data);
        setUserFormData({
          first_name: response.data.user.first_name || '',
          last_name: response.data.user.last_name || ''
        });
      } catch (error) {
        console.error('Failed to fetch customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setErrors({});
    setSuccessMessage('');
    setApiError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(customer || {});
    setUserFormData({
      first_name: customer?.user.first_name || '',
      last_name: customer?.user.last_name || ''
    });
    setErrors({});
    setSuccessMessage('');
    setApiError('');
  };

  const handleSave = async () => {
    if (!customer) return;
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setApiError('');
    setSuccessMessage('');
    
    try {
      // Update user profile (first_name, last_name)
      if (userFormData.first_name !== customer.user.first_name || 
          userFormData.last_name !== customer.user.last_name) {
        const userUpdateData = {
          first_name: userFormData.first_name,
          last_name: userFormData.last_name
        };
        
        const userResponse = await authAPI.updateProfile(userUpdateData);
        if (userResponse.data && setUser) {
          const token = localStorage.getItem('token');
          setUser(userResponse.data, token);
        }
      }
      
      // Update customer profile
      const updateData = {
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        website: formData.website,
        preferred_currency: formData.preferred_currency,
        preferred_language: formData.preferred_language,
        timezone: formData.timezone
      };
      
      const response = await customerAPI.updateCustomer(updateData);
      setCustomer(response.data);
      setEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setApiError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserInputChange = (field: string, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (userFormData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters long';
    }
    
    if (userFormData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="dashboard-empty">
        <h4 className="dashboard-empty-title">Profile Not Found</h4>
        <p className="dashboard-empty-text">Unable to load profile information.</p>
      </div>
    );
  }

  const getDisplayName = () => {
    if (customer.user.first_name && customer.user.last_name) {
      return `${customer.user.first_name} ${customer.user.last_name}`;
    }
    return customer.user.username;
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="dashboard-grid">
      {/* Profile Header Card */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Profile Information</h3>
          {!editing ? (
            <button
              onClick={handleEdit}
              className="dashboard-card-action"
              style={{
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                onClick={handleCancel}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: 'var(--success-color)',
                  color: 'white',
                  border: 'none',
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-card-body">
          {/* Success/Error Messages */}
          {successMessage && (
            <div style={{
              background: 'var(--success-light)',
              color: 'var(--success-color)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)',
              border: '1px solid var(--success-color)'
            }}>
              {successMessage}
            </div>
          )}
          
          {apiError && (
            <div style={{
              background: 'var(--error-light)',
              color: 'var(--error-color)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)',
              border: '1px solid var(--error-color)'
            }}>
              {apiError}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Avatar Section */}
            <div style={{ textAlign: 'center' }}>
              {customer.avatar_url ? (
                <img
                  src={customer.avatar_url}
                  alt="Profile"
                  className="dashboard-avatar"
                  style={{ width: '80px', height: '80px' }}
                />
              ) : (
                <div
                  className="dashboard-avatar-placeholder"
                  style={{ width: '80px', height: '80px', fontSize: 'var(--font-size-xl)' }}
                >
                  {getInitials()}
                </div>
              )}
              
              <p style={{ 
                margin: 'var(--space-2) 0 0', 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--text-secondary)' 
              }}>
                {editing ? 'Click to upload' : 'Profile Picture'}
              </p>
            </div>

            {/* Profile Form */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: 'var(--space-4)' 
              }}>
                {/* Personal Information */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)'
                  }}>
                    First Name
                  </label>
                  {editing ? (
                    <div>
                      <input
                        type="text"
                        value={userFormData.first_name}
                        onChange={(e) => handleUserInputChange('first_name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: 'var(--space-3)',
                          border: `1px solid ${errors.first_name ? 'var(--error-color)' : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--font-size-base)'
                        }}
                        placeholder="Enter first name"
                      />
                      {errors.first_name && (
                        <p style={{ 
                          margin: 'var(--space-1) 0 0', 
                          color: 'var(--error-color)', 
                          fontSize: 'var(--font-size-sm)' 
                        }}>
                          {errors.first_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ 
                      margin: 0, 
                      padding: 'var(--space-3)', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: 'var(--radius-md)',
                      minHeight: '1.5em'
                    }}>
                      {customer.user.first_name || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)'
                  }}>
                    Last Name
                  </label>
                  {editing ? (
                    <div>
                      <input
                        type="text"
                        value={userFormData.last_name}
                        onChange={(e) => handleUserInputChange('last_name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: 'var(--space-3)',
                          border: `1px solid ${errors.last_name ? 'var(--error-color)' : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--font-size-base)'
                        }}
                        placeholder="Enter last name"
                      />
                      {errors.last_name && (
                        <p style={{ 
                          margin: 'var(--space-1) 0 0', 
                          color: 'var(--error-color)', 
                          fontSize: 'var(--font-size-sm)' 
                        }}>
                          {errors.last_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ 
                      margin: 0, 
                      padding: 'var(--space-3)', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: 'var(--radius-md)',
                      minHeight: '1.5em'
                    }}>
                      {customer.user.last_name || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)'
                  }}>
                    Email
                  </label>
                  <p style={{ 
                    margin: 0, 
                    padding: 'var(--space-3)', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: 'var(--radius-md)',
                    minHeight: '1.5em',
                    opacity: 0.7
                  }}>
                    {customer.user.email} (cannot be changed)
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)'
                  }}>
                    Phone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-base)'
                      }}
                    />
                  ) : (
                    <p style={{ 
                      margin: 0, 
                      padding: 'var(--space-3)', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: 'var(--radius-md)',
                      minHeight: '1.5em'
                    }}>
                      {customer.phone || 'Not set'}
                    </p>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Account Status</h3>
        </div>
        <div className="dashboard-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              background: customer.is_verified ? 'var(--success-light)' : 'var(--warning-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {customer.is_verified ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
                </svg>
              )}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                {customer.is_verified ? 'Verified Account' : 'Verification Pending'}
              </h4>
              <p style={{ 
                margin: 'var(--space-1) 0 0', 
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {customer.is_verified 
                  ? 'Your account has been verified and all features are available.'
                  : 'Please check your email to verify your account.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;