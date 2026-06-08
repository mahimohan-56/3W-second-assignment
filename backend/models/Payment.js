const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentType: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: ['Bank', 'UPI', 'Paytm', 'PayPal', 'USDT']
  },
  // Bank fields
  bankName: {
    type: String,
    required: function() {
      return this.paymentType === 'Bank';
    }
  },
  branchName: {
    type: String,
    required: function() {
      return this.paymentType === 'Bank';
    }
  },
  ifscCode: {
    type: String,
    required: function() {
      return this.paymentType === 'Bank';
    },
    uppercase: true
  },
  accountNumber: {
    type: String,
    required: function() {
      return this.paymentType === 'Bank';
    }
  },
  accountHolderName: {
    type: String,
    required: function() {
      return this.paymentType === 'Bank';
    }
  },
  // Paytm fields
  paytmNumber: {
    type: String,
    required: function() {
      return this.paymentType === 'Paytm';
    }
  },
  // UPI fields
  upiId: {
    type: String,
    required: function() {
      return this.paymentType === 'UPI';
    }
  },
  // PayPal fields
  paypalEmail: {
    type: String,
    required: function() {
      return this.paymentType === 'PayPal';
    },
    lowercase: true
  },
  // USDT fields
  usdtAddress: {
    type: String,
    required: function() {
      return this.paymentType === 'USDT';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

paymentSchema.index({ user: 1, paymentType: 1 });
paymentSchema.index({ bankName: 1 });
paymentSchema.index({ ifscCode: 1 });
paymentSchema.index({ upiId: 1 });
paymentSchema.index({ paytmNumber: 1 });
paymentSchema.index({ paypalEmail: 1 });
paymentSchema.index({ usdtAddress: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
