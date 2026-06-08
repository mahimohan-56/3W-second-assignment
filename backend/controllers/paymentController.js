const Payment = require('../models/Payment');
const { body, validationResult } = require('express-validator');

const validatePayment = (paymentType) => {
  const baseValidation = [
    body('paymentType').isIn(['Bank', 'UPI', 'Paytm', 'PayPal', 'USDT']).withMessage('Invalid payment type')
  ];

  switch (paymentType) {
    case 'Bank':
      return [
        ...baseValidation,
        body('bankName').notEmpty().withMessage('Bank name is required'),
        body('branchName').notEmpty().withMessage('Branch name is required'),
        body('ifscCode').notEmpty().withMessage('IFSC code is required'),
        body('accountNumber').notEmpty().withMessage('Account number is required'),
        body('accountHolderName').notEmpty().withMessage('Account holder name is required')
      ];
    case 'UPI':
      return [
        ...baseValidation,
        body('upiId').notEmpty().withMessage('UPI ID is required')
      ];
    case 'Paytm':
      return [
        ...baseValidation,
        body('paytmNumber').notEmpty().withMessage('Paytm number is required')
      ];
    case 'PayPal':
      return [
        ...baseValidation,
        body('paypalEmail').isEmail().withMessage('Valid PayPal email is required')
      ];
    case 'USDT':
      return [
        ...baseValidation,
        body('usdtAddress').notEmpty().withMessage('USDT address is required')
      ];
    default:
      return baseValidation;
  }
};

const createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentType } = req.body;
    
    const paymentData = {
      user: req.user._id,
      paymentType
    };

    switch (paymentType) {
      case 'Bank':
        paymentData.bankName = req.body.bankName;
        paymentData.branchName = req.body.branchName;
        paymentData.ifscCode = req.body.ifscCode.toUpperCase();
        paymentData.accountNumber = req.body.accountNumber;
        paymentData.accountHolderName = req.body.accountHolderName;
        break;
      case 'UPI':
        paymentData.upiId = req.body.upiId;
        break;
      case 'Paytm':
        paymentData.paytmNumber = req.body.paytmNumber;
        break;
      case 'PayPal':
        paymentData.paypalEmail = req.body.paypalEmail.toLowerCase();
        break;
      case 'USDT':
        paymentData.usdtAddress = req.body.usdtAddress;
        break;
      default:
        return res.status(400).json({ message: 'Invalid payment type' });
    }

    const payment = await Payment.create(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Check if payment belongs to user
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this payment method' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment method
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Check if payment belongs to user
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this payment method' });
    }

    // Update fields based on payment type
    const { paymentType } = payment;

    switch (paymentType) {
      case 'Bank':
        if (req.body.bankName) payment.bankName = req.body.bankName;
        if (req.body.branchName) payment.branchName = req.body.branchName;
        if (req.body.ifscCode) payment.ifscCode = req.body.ifscCode.toUpperCase();
        if (req.body.accountNumber) payment.accountNumber = req.body.accountNumber;
        if (req.body.accountHolderName) payment.accountHolderName = req.body.accountHolderName;
        break;
      case 'UPI':
        if (req.body.upiId) payment.upiId = req.body.upiId;
        break;
      case 'Paytm':
        if (req.body.paytmNumber) payment.paytmNumber = req.body.paytmNumber;
        break;
      case 'PayPal':
        if (req.body.paypalEmail) payment.paypalEmail = req.body.paypalEmail.toLowerCase();
        break;
      case 'USDT':
        if (req.body.usdtAddress) payment.usdtAddress = req.body.usdtAddress;
        break;
    }

    payment.updatedAt = Date.now();
    const updatedPayment = await payment.save();

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete payment method
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Check if payment belongs to user
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this payment method' });
    }

    await payment.deleteOne();
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  validatePayment
};
