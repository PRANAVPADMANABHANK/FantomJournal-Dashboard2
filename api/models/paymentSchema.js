const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  merchantId: String,
  merchantTransactionId: String,
  transactionId: String,
  amount: Number,
  originalAmount: Number, // Store the original amount
  name: String, // Store user name
  mobile: String, // Store user mobile
  state: String,
  responseCode: String,
  paymentInstrument: Object,
  success: Boolean,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
