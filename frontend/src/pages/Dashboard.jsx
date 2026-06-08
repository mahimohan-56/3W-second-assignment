import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedModal, setSelectedModal] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showPaymentsList, setShowPaymentsList] = useState(false);
  const [formData, setFormData] = useState({
    // Bank fields
    bankName: '',
    branchName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    confirmAccountNumber: '',
    // UPI fields
    upiId: '',
    confirmUpiId: '',
    // Paytm fields
    paytmNumber: '',
    confirmPaytmNumber: '',
    // PayPal fields
    paypalEmail: '',
    confirmPaypalEmail: '',
    // USDT fields
    usdtAddress: '',
    confirmUsdtAddress: ''
  });

  const toggleModal = (modalId) => {
    setSelectedModal(selectedModal === modalId ? null : modalId);
    setEditingPayment(null);
    if (!modalId) {
      // Reset form when closing
      setFormData({
        bankName: '',
        branchName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        confirmAccountNumber: '',
        upiId: '',
        confirmUpiId: '',
        paytmNumber: '',
        confirmPaytmNumber: '',
        paypalEmail: '',
        confirmPaypalEmail: '',
        usdtAddress: '',
        confirmUsdtAddress: ''
      });
    }
  };

  // Fetch user's payment methods
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPayments();
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert(error.response?.data?.message || 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate confirmations match
  const validateConfirmation = (type) => {
    switch (type) {
      case 'bank':
        if (formData.accountNumber !== formData.confirmAccountNumber) {
          alert('Account numbers do not match!');
          return false;
        }
        break;
      case 'upi':
      case 'gpay':
      case 'phonepe':
        if (formData.upiId !== formData.confirmUpiId) {
          alert('UPI IDs do not match!');
          return false;
        }
        break;
      case 'paytm':
        if (formData.paytmNumber !== formData.confirmPaytmNumber) {
          alert('Paytm numbers do not match!');
          return false;
        }
        break;
      case 'paypal':
        if (formData.paypalEmail !== formData.confirmPaypalEmail) {
          alert('PayPal emails do not match!');
          return false;
        }
        break;
      case 'usdt':
        if (formData.usdtAddress !== formData.confirmUsdtAddress) {
          alert('USDT addresses do not match!');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    
    if (!validateConfirmation(type)) {
      return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Processing...';
    btn.disabled = true;

    try {
      let paymentData = { 
        paymentType: type === 'bank' ? 'Bank' : 
                     type === 'upi' || type === 'gpay' || type === 'phonepe' ? 'UPI' : 
                     type === 'paytm' ? 'Paytm' : 
                     type === 'paypal' ? 'PayPal' : 'USDT' 
      };

      switch (type) {
        case 'bank':
          paymentData = {
            ...paymentData,
            bankName: formData.bankName,
            branchName: formData.branchName,
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode.toUpperCase()
          };
          break;
        case 'upi':
        case 'gpay':
        case 'phonepe':
          paymentData = {
            ...paymentData,
            upiId: formData.upiId
          };
          break;
        case 'paytm':
          paymentData = {
            ...paymentData,
            paytmNumber: formData.paytmNumber
          };
          break;
        case 'paypal':
          paymentData = {
            ...paymentData,
            paypalEmail: formData.paypalEmail
          };
          break;
        case 'usdt':
          paymentData = {
            ...paymentData,
            usdtAddress: formData.usdtAddress
          };
          break;
      }

      if (editingPayment) {
        await paymentAPI.updatePayment(editingPayment._id, paymentData);
        btn.innerHTML = 'Updated Successfully!';
      } else {
        await paymentAPI.createPayment(paymentData);
        btn.innerHTML = 'Added Successfully!';
      }
      
      btn.style.backgroundColor = '#16A34A';
      
      // Refresh payments list
      await fetchPayments();
      
      setTimeout(() => {
        toggleModal(null);
        btn.innerHTML = originalContent;
        btn.style.backgroundColor = '';
        btn.disabled = false;
      }, 1000);
    } catch (error) {
      console.error('Error submitting payment:', error);
      btn.innerHTML = originalContent;
      btn.disabled = false;
      alert(error.response?.data?.message || 'Failed to save payment method');
    }
  };

  // Edit payment method
  const handleEdit = (payment) => {
    setEditingPayment(payment);
    
    // Populate form with existing data
    const newFormData = { ...formData };
    
    switch (payment.paymentType) {
      case 'Bank':
        newFormData.bankName = payment.bankName || '';
        newFormData.branchName = payment.branchName || '';
        newFormData.accountHolderName = payment.accountHolderName || '';
        newFormData.accountNumber = payment.accountNumber || '';
        newFormData.confirmAccountNumber = payment.accountNumber || '';
        newFormData.ifscCode = payment.ifscCode || '';
        setSelectedModal('bank-modal');
        break;
      case 'UPI':
        newFormData.upiId = payment.upiId || '';
        newFormData.confirmUpiId = payment.upiId || '';
        // Default to UPI modal, but you could detect GPay/PhonePe from UPI ID suffix
        setSelectedModal('upi-modal');
        break;
      case 'Paytm':
        newFormData.paytmNumber = payment.paytmNumber || '';
        newFormData.confirmPaytmNumber = payment.paytmNumber || '';
        setSelectedModal('paytm-modal');
        break;
      case 'PayPal':
        newFormData.paypalEmail = payment.paypalEmail || '';
        newFormData.confirmPaypalEmail = payment.paypalEmail || '';
        setSelectedModal('paypal-modal');
        break;
      case 'USDT':
        newFormData.usdtAddress = payment.usdtAddress || '';
        newFormData.confirmUsdtAddress = payment.usdtAddress || '';
        setSelectedModal('usdt-modal');
        break;
    }
    
    setFormData(newFormData);
  };

  // Delete payment method
  const handleDelete = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      await paymentAPI.deletePayment(paymentId);
      alert('Payment method deleted successfully');
      await fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert(error.response?.data?.message || 'Failed to delete payment method');
    }
  };

  // Get first letter of username for avatar
  const getInitial = () => {
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="dashboard-page">
      {/* Top Navigation Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <img 
            alt="PaymentManage Logo" 
            className="header-logo" 
            src="https://play-lh.googleusercontent.com/Z5aOARn89MpGrTp_GeVe5tnT-2YgD15I8drTOEzim_6ncc9wQN9O0xjr8-uLa6o7Dw=w240-h480-rw"
          />
          <h1 className="header-title">PaymentManage</h1>
        </div>
        <div className="header-right">
          {/* Points Display */}
          <div className="badge-container">
            <span className="badge-text">52</span>
            <span className="material-symbols-outlined badge-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
          </div>
          {/* Balance Display */}
          <div className="badge-container">
            <span className="badge-text primary">₹0.00</span>
          </div>
          {/* Notifications */}
          <button className="icon-btn">
            <span className="material-symbols-outlined">notifications</span>
            <span className="notification-badge">2</span>
          </button>
          {/* Profile Avatar with Initial */}
          <div className="profile-container">
            <div className="profile-avatar" onClick={toggleProfileMenu}>
              {getInitial()}
            </div>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <span className="profile-username">{user?.username || 'User'}</span>
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

      <main className="dashboard-main">
        {/* My Payment Methods Section */}
        {payments.length > 0 && (
          <div className="my-payments-section">
            <div className="section-header">
              <h2>My Payment Methods</h2>
              <button className="view-all-btn" onClick={() => setShowPaymentsList(!showPaymentsList)}>
                {showPaymentsList ? 'Hide' : 'View All'} ({payments.length})
              </button>
            </div>

            {showPaymentsList && (
              <div className="payments-list">
                {payments.map((payment) => (
                  <div key={payment._id} className="payment-card-item">
                    <div className="payment-card-header">
                      <div className="payment-type-badge">
                        {payment.paymentType === 'Bank' && (
                          <span className="material-symbols-outlined">account_balance</span>
                        )}
                        {payment.paymentType === 'UPI' && (
                          <img src="https://images.icon-icons.com/2699/PNG/512/upi_logo_icon_170312.png" alt="UPI" style={{ width: '20px', height: '20px' }} />
                        )}
                        {payment.paymentType === 'Paytm' && (
                          <span className="material-symbols-outlined">account_balance_wallet</span>
                        )}
                        {payment.paymentType === 'PayPal' && (
                          <span className="material-symbols-outlined">payment</span>
                        )}
                        {payment.paymentType === 'USDT' && (
                          <span className="material-symbols-outlined">currency_bitcoin</span>
                        )}
                        <span>{payment.paymentType}</span>
                      </div>
                      <div className="payment-card-actions">
                        <button onClick={() => handleEdit(payment)} className="edit-btn">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button onClick={() => handleDelete(payment._id)} className="delete-btn">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="payment-card-details">
                      {payment.paymentType === 'Bank' && (
                        <>
                          <p><strong>Bank:</strong> {payment.bankName}</p>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Section Header */}
        <div className="section-header">
          <h2>Add Payment Options</h2>
          <p>Select your preferred method to receive payments</p>
        </div>

        {/* Payment Option Grid */}
        <div className="payment-grid">
          {/* Bank Card */}
          <button className="payment-card" onClick={() => toggleModal('bank-modal')}>
            <span className="material-symbols-outlined payment-icon tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance
            </span>
            <span className="payment-label">Bank</span>
          </button>

          {/* USDT Card */}
          <button className="payment-card" onClick={() => toggleModal('usdt-modal')}>
            <span className="material-symbols-outlined payment-icon primary">
              currency_bitcoin
            </span>
            <span className="payment-label">BNB USDT</span>
          </button>

          {/* UPI Card */}
          <button className="payment-card" onClick={() => toggleModal('upi-modal')}>
            <div className="payment-img-wrapper">
              <img 
                src="https://images.icon-icons.com/2699/PNG/512/upi_logo_icon_170312.png" 
                alt="UPI Logo"
              />
            </div>
            <span className="payment-label">UPI</span>
          </button>

          {/* GPay Card */}
          <button className="payment-card" onClick={() => toggleModal('gpay-modal')}>
            <img 
              alt="GPay" 
              className="payment-img" 
              src="https://play-lh.googleusercontent.com/Fm5PDRimTL_KsWyIRcTv9h0JLrTkDOMwh18SE819OXjEZhlwMYBHJXxUZ8eOBudxCsHC=w480-h960-rw"
            />
            <span className="payment-label">GPay</span>
          </button>

          {/* PhonePe Card */}
          <button className="payment-card" onClick={() => toggleModal('phonepe-modal')}>
            <img 
              alt="PhonePe" 
              className="payment-img" 
              src="https://play-lh.googleusercontent.com/6iyA2zVz5PyyMjK5SIxdUhrb7oh9cYVXJ93q6DZkmx07Er1o90PXYeo6mzL4VC2Gj9s=w480-h960-rw"
            />
            <span className="payment-label">PhonePe</span>
          </button>

          {/* Paytm Card */}
          <button className="payment-card" onClick={() => toggleModal('paytm-modal')}>
            <img 
              alt="Paytm" 
              className="payment-img" 
              src="https://play-lh.googleusercontent.com/WDGsMRuVENnZPEpV4DEaXw12qtMY3em85xpmZqcXzeh0iT_eXFtAU9VUj-Z7xNQQd5DMqrkKSs9D0qbI1rlt=s96-rw"
            />
            <span className="payment-label">Paytm</span>
          </button>

          {/* PayPal Card */}
          <button className="payment-card" onClick={() => toggleModal('paypal-modal')}>
            <img 
              alt="PayPal" 
              className="payment-img" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaagmyuxS_Mlb2XcGIEhkHGy5E4fboRzLkejUteYyZ0PCHT7beFHkwvkhjNw9Ku84H1HXcR_tMW0aAzk9yW8Xm2ut3ImGB37G7D0LXpbWTVkgYTbaoFPAAnSvlACa-_I3p5JGePyxgJRxaNP6KMams-YxHDHkLzWltZRaymfer6N-jysApsL7wuGuXxoVRiAprTkDT7baoVMpP_GU8SJNVoOTFuqktbZhFeOLOYs0zB_SbO8qOOfpHg7JHWgnaKV5bUsrC4-E2RvxT"
            />
            <span className="payment-label">PayPal</span>
          </button>

          {/* PalmPay Card */}
          <button className="payment-card">
            <span className="material-symbols-outlined payment-icon">
              radio_button_checked
            </span>
            <span className="payment-label">PalmPay</span>
          </button>
        </div>

        {/* Disclaimer Section */}
        <div className="disclaimer-box">
          <div className="disclaimer-header">
            <span className="material-symbols-outlined">lightbulb</span>
            <h3>Disclaimer</h3>
          </div>
          <ul className="disclaimer-list">
            <li>
              <span className="list-number">1.</span>
              <span>Use only a bank account that matches your profile name to ensure successful transfers.</span>
            </li>
            <li>
              <span className="list-number">2.</span>
              <span>Do not link the same bank account to multiple PaymentManage accounts.</span>
            </li>
            <li>
              <span className="list-number">3.</span>
              <span>Fraudulent activity or incorrect details may result in account blocking or loss of funds.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <a className="nav-item active" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="nav-label">Home</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined">assignment</span>
          <span className="nav-label">Tasks</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined">groups</span>
          <span className="nav-label">Social</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="nav-label">Board</span>
        </a>
      </nav>

      {/* UPI Modal */}
      {selectedModal === 'upi-modal' && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => toggleModal(null)}></div>
          <div className="modal-content">
            <div className="modal-handle"></div>
            <div className="modal-header">
              <h3>{editingPayment ? 'Edit UPI ID' : 'Add UPI ID'}</h3>
              <div className="upi-icon-wrapper">
                <img 
                  src="https://images.icon-icons.com/2699/PNG/512/upi_logo_icon_170312.png" 
                  alt="UPI"
                  style={{ width: '40px', height: '40px' }}
                />
              </div>
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'upi')}>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">alternate_email</span>
                <input
                  className="modal-input"
                  placeholder="Enter UPI ID"
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">verified</span>
                <input
                  className="modal-input"
                  placeholder="Confirm UPI ID"
                  type="text"
                  name="confirmUpiId"
                  value={formData.confirmUpiId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="modal-submit-btn" type="submit">
                {editingPayment ? 'Update UPI' : 'Add UPI'}
              </button>
            </form>
            <button className="modal-cancel-btn" onClick={() => toggleModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {selectedModal === 'bank-modal' && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => toggleModal(null)}></div>
          <div className="modal-content">
            <div className="modal-handle"></div>
            <div className="modal-header">
              <h3>{editingPayment ? 'Edit Bank Account' : 'Add Bank Account'}</h3>
              <span className="material-symbols-outlined tertiary-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance
              </span>
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'bank')}>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">account_balance</span>
                <input
                  className="modal-input"
                  placeholder="Enter Bank Name"
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">apartment</span>
                <input
                  className="modal-input"
                  placeholder="Branch Name"
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">person</span>
                <input
                  className="modal-input"
                  placeholder="Account Holder Name"
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">numbers</span>
                <input
                  className="modal-input"
                  placeholder="Enter Account Number"
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">check_circle</span>
                <input
                  className="modal-input"
                  placeholder="Confirm Account Number"
                  type="text"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">code</span>
                <input
                  className="modal-input"
                  placeholder="Enter IFSC Code"
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="modal-submit-btn" type="submit">
                {editingPayment ? 'Update Bank Account' : 'Add Bank Account'}
              </button>
            </form>
            <button className="modal-cancel-btn" onClick={() => toggleModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Paytm Modal */}
      {selectedModal === 'paytm-modal' && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => toggleModal(null)}></div>
          <div className="modal-content">
            <div className="modal-handle"></div>
            <div className="modal-header">
              <h3>{editingPayment ? 'Edit Paytm' : 'Add Paytm'}</h3>
              <img 
                src="https://play-lh.googleusercontent.com/WDGsMRuVENnZPEpV4DEaXw12qtMY3em85xpmZqcXzeh0iT_eXFtAU9VUj-Z7xNQQd5DMqrkKSs9D0qbI1rlt=s96-rw" 
                alt="Paytm"
                style={{ width: '40px', height: '40px', borderRadius: '8px' }}
              />
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'paytm')}>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">phone</span>
                <input
                  className="modal-input"
                  placeholder="Enter Paytm Number"
                  type="tel"
                  name="paytmNumber"
                  value={formData.paytmNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">verified</span>
                <input
                  className="modal-input"
                  placeholder="Confirm Paytm Number"
                  type="tel"
                  name="confirmPaytmNumber"
                  value={formData.confirmPaytmNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="modal-submit-btn" type="submit">
                {editingPayment ? 'Update Paytm' : 'Add Paytm'}
              </button>
            </form>
            <button className="modal-cancel-btn" onClick={() => toggleModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PayPal Modal */}
      {selectedModal === 'paypal-modal' && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => toggleModal(null)}></div>
          <div className="modal-content">
            <div className="modal-handle"></div>
            <div className="modal-header">
              <h3>{editingPayment ? 'Edit PayPal' : 'Add PayPal'}</h3>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaagmyuxS_Mlb2XcGIEhkHGy5E4fboRzLkejUteYyZ0PCHT7beFHkwvkhjNw9Ku84H1HXcR_tMW0aAzk9yW8Xm2ut3ImGB37G7D0LXpbWTVkgYTbaoFPAAnSvlACa-_I3p5JGePyxgJRxaNP6KMams-YxHDHkLzWltZRaymfer6N-jysApsL7wuGuXxoVRiAprTkDT7baoVMpP_GU8SJNVoOTFuqktbZhFeOLOYs0zB_SbO8qOOfpHg7JHWgnaKV5bUsrC4-E2RvxT" 
                alt="PayPal"
                style={{ width: '40px', height: '40px' }}
              />
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'paypal')}>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">email</span>
                <input
                  className="modal-input"
                  placeholder="Enter PayPal Email"
                  type="email"
                  name="paypalEmail"
                  value={formData.paypalEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">verified</span>
                <input
                  className="modal-input"
                  placeholder="Confirm PayPal Email"
                  type="email"
                  name="confirmPaypalEmail"
                  value={formData.confirmPaypalEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="modal-submit-btn" type="submit">
                {editingPayment ? 'Update PayPal' : 'Add PayPal'}
              </button>
            </form>
            <button className="modal-cancel-btn" onClick={() => toggleModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* USDT Modal */}
      {selectedModal === 'usdt-modal' && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => toggleModal(null)}></div>
          <div className="modal-content">
            <div className="modal-handle"></div>
            <div className="modal-header">
              <h3>{editingPayment ? 'Edit USDT' : 'Add USDT'}</h3>
              <span className="material-symbols-outlined primary-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                currency_bitcoin
              </span>
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'usdt')}>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">account_balance_wallet</span>
                <input
                  className="modal-input"
                  placeholder="Enter USDT Wallet Address"
                  type="text"
                  name="usdtAddress"
                  value={formData.usdtAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">verified</span>
                <input
                  className="modal-input"
                  placeholder="Confirm USDT Wallet Address"
                  type="text"
                  name="confirmUsdtAddress"
                  value={formData.confirmUsdtAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="modal-submit-btn" type="submit">
                {editingPayment ? 'Update USDT' : 'Add USDT'}
              </button>
            </form>
            <button className="modal-cancel-btn" onClick={() => toggleModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* GPay Modal */}
      {selectedModal === 'gpay-modal' && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => toggleModal(null)}></div>
          <div className="modal-content">
            <div className="modal-handle"></div>
            <div className="modal-header">
              <h3>{editingPayment ? 'Edit GPay UPI' : 'Add GPay UPI'}</h3>
              <img 
                src="https://play-lh.googleusercontent.com/Fm5PDRimTL_KsWyIRcTv9h0JLrTkDOMwh18SE819OXjEZhlwMYBHJXxUZ8eOBudxCsHC=w480-h960-rw" 
                alt="GPay"
                style={{ width: '40px', height: '40px', borderRadius: '8px' }}
              />
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'gpay')}>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">alternate_email</span>
                <input
                  className="modal-input"
                  placeholder="Enter UPI ID (e.g., name@okaxis)"
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">verified</span>
                <input
                  className="modal-input"
                  placeholder="Confirm UPI ID"
                  type="text"
                  name="confirmUpiId"
                  value={formData.confirmUpiId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="modal-submit-btn" type="submit">
                {editingPayment ? 'Update GPay UPI' : 'Add GPay UPI'}
              </button>
            </form>
            <button className="modal-cancel-btn" onClick={() => toggleModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PhonePe Modal */}
      {selectedModal === 'phonepe-modal' && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => toggleModal(null)}></div>
          <div className="modal-content">
            <div className="modal-handle"></div>
            <div className="modal-header">
              <h3>{editingPayment ? 'Edit PhonePe UPI' : 'Add PhonePe UPI'}</h3>
              <img 
                src="https://play-lh.googleusercontent.com/6iyA2zVz5PyyMjK5SIxdUhrb7oh9cYVXJ93q6DZkmx07Er1o90PXYeo6mzL4VC2Gj9s=w480-h960-rw" 
                alt="PhonePe"
                style={{ width: '40px', height: '40px', borderRadius: '8px' }}
              />
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'phonepe')}>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">alternate_email</span>
                <input
                  className="modal-input"
                  placeholder="Enter UPI ID (e.g., name@ybl)"
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <span className="material-symbols-outlined field-icon">verified</span>
                <input
                  className="modal-input"
                  placeholder="Confirm UPI ID"
                  type="text"
                  name="confirmUpiId"
                  value={formData.confirmUpiId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="modal-submit-btn" type="submit">
                {editingPayment ? 'Update PhonePe UPI' : 'Add PhonePe UPI'}
              </button>
            </form>
            <button className="modal-cancel-btn" onClick={() => toggleModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
