const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
  user: {
      type: Array,
      defalut: [],
  },
  data: {
      type: Array,
      defalut: [],
  },
  product: {
      type: Array,
      defalut: [],
  }
}, { timestamps: true })

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Payment }