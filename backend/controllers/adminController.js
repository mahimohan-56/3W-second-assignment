const User = require('../models/User');
const Payment = require('../models/Payment');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      },
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchPayments = async (req, res) => {
  try {
    const {
      username,
      paymentType,
      bankName,
      ifscCode,
      paytmNumber,
      upiId,
      paypalEmail,
      usdtAddress
    } = req.query;

    let query = {};

    if (username) {
      const users = await User.find({
        username: { $regex: username, $options: 'i' }
      }).select('_id');
      
      if (users.length === 0) {
        return res.json({
          success: true,
          count: 0,
          data: []
        });
      }
      
      query.user = { $in: users.map(u => u._id) };
    }

    if (paymentType) {
      query.paymentType = paymentType;
    }

    if (bankName) {
      query.bankName = { $regex: bankName, $options: 'i' };
    }

    if (ifscCode) {
      query.ifscCode = { $regex: ifscCode, $options: 'i' };
    }

    if (paytmNumber) {
      query.paytmNumber = { $regex: paytmNumber, $options: 'i' };
    }

    if (upiId) {
      query.upiId = { $regex: upiId, $options: 'i' };
    }

    if (paypalEmail) {
      query.paypalEmail = { $regex: paypalEmail, $options: 'i' };
    }

    if (usdtAddress) {
      query.usdtAddress = { $regex: usdtAddress, $options: 'i' };
    }

    const payments = await Payment.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      filters: req.query,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllPayments,
  getUserPayments,
  searchPayments
};
