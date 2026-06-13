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
app.get('/', (req, res) => res.json({ message: 'LocalApp API Running' }));
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('MongoDB Connected'); app.listen(process.env.PORT, () => console.log('Server running on port ' + process.env.PORT)); })
  .catch(err => console.error('DB Error:', err));
