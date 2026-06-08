import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPayments, setUserPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    paymentType: '',
    bankName: '',
    ifscCode: '',
    paytmNumber: '',
    upiId: '',
    paypalEmail: '',
    usdtAddress: ''
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all payments
  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllPayments();
      setAllPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert(error.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments for specific user
  const fetchUserPayments = async (userId) => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserPayments(userId);
      setUserPayments(response.data.data);
      setSelectedUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user payments:', error);
      alert(error.response?.data?.message || 'Failed to fetch user payments');
    } finally {
      setLoading(false);
    }
  };

  // Search payments with filters
  const handleSearch = async () => {
    try {
      setLoading(true);
      // Remove empty filters
      const filters = Object.fromEntries(
        Object.entries(searchFilters).filter(([_, value]) => value !== '')
      );
      
      const response = await adminAPI.searchPayments(filters);
      setAllPayments(response.data.data);
    } catch (error) {
      console.error('Error searching payments:', error);
      alert(error.response?.data?.message || 'Failed to search payments');
    } finally {
      setLoading(false);
    }
  };

  // Clear filters and reload all payments
  const clearFilters = () => {
    setSearchFilters({
      username: '',
      paymentType: '',
      bankName: '',
      ifscCode: '',
      paytmNumber: '',
      upiId: '',
      paypalEmail: '',
      usdtAddress: ''
    });
    fetchAllPayments();
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'payments') {
      fetchAllPayments();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const getInitial = () => {
    return user?.username?.charAt(0).toUpperCase() || 'A';
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <span className="material-symbols-outlined admin-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
            admin_panel_settings
          </span>
          <h1 className="header-title">Admin Panel</h1>
        </div>
        <div className="header-right">
          <div className="badge-container">
            <span className="badge-text">Admin</span>
          </div>
          <div className="profile-container">
            <div className="profile-avatar" onClick={toggleProfileMenu}>
              {getInitial()}
            </div>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <span className="profile-username">{user?.username || 'Admin'}</span>
                  <span className="profile-email">{user?.email || ''}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  <span className="material-symbols-outlined">logout</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="material-symbols-outlined">group</span>
          <span>Users</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <span className="material-symbols-outlined">payments</span>
          <span>All Payments</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="admin-main">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Registered Users ({users.length})</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="users-list">
                {users.map((u) => (
                  <div key={u._id} className="user-card">
                    <div className="user-info">
                      <div className="user-avatar">{u.username.charAt(0).toUpperCase()}</div>
                      <div className="user-details">
                        <h3>{u.username}</h3>
                        <p>{u.email}</p>
                        <span className="user-role">{u.role}</span>
                      </div>
                    </div>
                    <button
                      className="view-payments-btn"
                      onClick={() => {
                        fetchUserPayments(u._id);
                        setActiveTab('user-payments');
                      }}
                    >
                      View Payments
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Payments Tab */}
        {activeTab === 'payments' && (
          <div className="payments-section">
            <h2>All Payment Methods ({allPayments.length})</h2>
            
            {/* Search Filters */}
            <div className="search-filters">
              <h3>Search & Filter</h3>
              <div className="filter-grid">
                <input
                  type="text"
                  placeholder="Username"
                  value={searchFilters.username}
                  onChange={(e) => setSearchFilters({ ...searchFilters, username: e.target.value })}
                />
                <select
                  value={searchFilters.paymentType}
                  onChange={(e) => setSearchFilters({ ...searchFilters, paymentType: e.target.value })}
                >
                  <option value="">All Payment Types</option>
                  <option value="Bank">Bank</option>
                  <option value="UPI">UPI</option>
                  <option value="Paytm">Paytm</option>
                  <option value="PayPal">PayPal</option>
                  <option value="USDT">USDT</option>
                </select>
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={searchFilters.bankName}
                  onChange={(e) => setSearchFilters({ ...searchFilters, bankName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={searchFilters.ifscCode}
                  onChange={(e) => setSearchFilters({ ...searchFilters, ifscCode: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="UPI ID"
                  value={searchFilters.upiId}
                  onChange={(e) => setSearchFilters({ ...searchFilters, upiId: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Paytm Number"
                  value={searchFilters.paytmNumber}
                  onChange={(e) => setSearchFilters({ ...searchFilters, paytmNumber: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="PayPal Email"
                  value={searchFilters.paypalEmail}
                  onChange={(e) => setSearchFilters({ ...searchFilters, paypalEmail: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="USDT Address"
                  value={searchFilters.usdtAddress}
                  onChange={(e) => setSearchFilters({ ...searchFilters, usdtAddress: e.target.value })}
                />
              </div>
              <div className="filter-actions">
                <button className="search-btn" onClick={handleSearch}>
                  <span className="material-symbols-outlined">search</span>
                  Search
                </button>
                <button className="clear-btn" onClick={clearFilters}>
                  <span className="material-symbols-outlined">clear</span>
                  Clear
                </button>
              </div>
            </div>

            {/* Payments List */}
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="payments-list">
                {allPayments.map((payment) => (
                  <div key={payment._id} className="payment-card-admin">
                    <div className="payment-header">
                      <div className="payment-type-badge">
                        {payment.paymentType}
                      </div>
                      <div className="user-badge">
                        <span className="material-symbols-outlined">person</span>
                        {payment.user?.username || 'Unknown'}
                      </div>
                    </div>
                    <div className="payment-details">
                      {payment.paymentType === 'Bank' && (
                        <>
                          <p><strong>Bank:</strong> {payment.bankName}</p>
                          <p><strong>Branch:</strong> {payment.branchName}</p>
                          <p><strong>Account:</strong> {payment.accountNumber}</p>
                          <p><strong>Holder:</strong> {payment.accountHolderName}</p>
                          <p><strong>IFSC:</strong> {payment.ifscCode}</p>
                        </>
                      )}
                      {payment.paymentType === 'UPI' && (
                        <p><strong>UPI ID:</strong> {payment.upiId}</p>
                      )}
                      {payment.paymentType === 'Paytm' && (
                        <p><strong>Paytm:</strong> {payment.paytmNumber}</p>
                      )}
                      {payment.paymentType === 'PayPal' && (
                        <p><strong>PayPal:</strong> {payment.paypalEmail}</p>
                      )}
                      {payment.paymentType === 'USDT' && (
                        <p><strong>USDT:</strong> {payment.usdtAddress}</p>
                      )}
                      <p className="date-info">
                        <strong>Added:</strong> {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Payments Tab */}
        {activeTab === 'user-payments' && selectedUser && (
          <div className="user-payments-section">
            <button className="back-btn" onClick={() => setActiveTab('users')}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Users
            </button>
            <h2>{selectedUser.username}'s Payment Methods ({userPayments.length})</h2>
            <p className="user-email">{selectedUser.email}</p>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="payments-list">
                {userPayments.map((payment) => (
                  <div key={payment._id} className="payment-card-admin">
                    <div className="payment-header">
                      <div className="payment-type-badge">
                        {payment.paymentType}
                      </div>
                    </div>
                    <div className="payment-details">
                      {payment.paymentType === 'Bank' && (
                        <>
                          <p><strong>Bank:</strong> {payment.bankName}</p>
                          <p><strong>Branch:</strong> {payment.branchName}</p>
                          <p><strong>Account:</strong> {payment.accountNumber}</p>
                          <p><strong>Holder:</strong> {payment.accountHolderName}</p>
                          <p><strong>IFSC:</strong> {payment.ifscCode}</p>
                        </>
                      )}
                      {payment.paymentType === 'UPI' && (
                        <p><strong>UPI ID:</strong> {payment.upiId}</p>
                      )}
                      {payment.paymentType === 'Paytm' && (
                        <p><strong>Paytm:</strong> {payment.paytmNumber}</p>
                      )}
                      {payment.paymentType === 'PayPal' && (
                        <p><strong>PayPal:</strong> {payment.paypalEmail}</p>
                      )}
                      {payment.paymentType === 'USDT' && (
                        <p><strong>USDT:</strong> {payment.usdtAddress}</p>
                      )}
                      <p className="date-info">
                        <strong>Added:</strong> {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {userPayments.length === 0 && (
                  <p className="no-data">No payment methods added yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
