const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/promos', require('./routes/promos'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payment', require('./routes/payment'));
app.get('/', (req, res) => res.json({ message: 'LocalApp API V4 Running ✅ - Doraha, Ludhiana' }));
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('MongoDB Connected ✅'); app.listen(process.env.PORT || 5000, () => console.log('Server running ✅')); })
  .catch(err => console.error('DB Error:', err));
