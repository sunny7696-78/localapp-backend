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
app.get('/', (req, res) => res.json({ message: 'LocalApp API Running V3 ✅' }));

// TEMPORARY SEED ROUTE - delete after use
app.get('/run-seed-now', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Restaurant = require('./models/Restaurant');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Restaurant.deleteMany({});

    const admin = await User.create({ name: 'Admin', phone: '9999999999', password: 'admin123', role: 'admin', address: { area: 'Doraha Mandi', city: 'Doraha, Ludhiana' } });
    await User.create({ name: 'Harpreet Driver', phone: '9876543210', password: 'user123', role: 'driver', vehicle: { type: 'bike', number: 'PB10AB1234', model: 'Honda Activa' }, isAvailable: true, address: { area: 'Doraha Bus Stand', city: 'Doraha' } });
    await User.create({ name: 'Gurpreet Singh', phone: '9876500001', password: 'user123', role: 'customer', address: { street: 'H.No. 45, Gali 3', area: 'Doraha Mandi', city: 'Doraha, Ludhiana' } });
    await User.create({ name: 'Sharma Store', phone: '9876500002', password: 'user123', role: 'vendor', address: { street: 'Main Market', area: 'Doraha Mandi', city: 'Doraha' } });

    const products = [
      { name: 'Amul Gold Milk 1L', price: 66, mrp: 70, category: 'dairy', unit: 'litre', stock: 50 },
      { name: 'Amul Butter 500g', price: 245, mrp: 265, category: 'dairy', unit: 'pack', stock: 30 },
      { name: 'Paneer Fresh 200g', price: 90, mrp: 100, category: 'dairy', unit: 'pack', stock: 25 },
      { name: 'Tamatar 1kg', price: 35, mrp: 45, category: 'vegetables', unit: 'kg', stock: 100 },
      { name: 'Pyaaz 1kg', price: 28, mrp: 35, category: 'vegetables', unit: 'kg', stock: 100 },
      { name: 'Maggi 12-pack', price: 118, mrp: 144, category: 'snacks', unit: 'pack', stock: 40 },
      { name: 'Tata Tea Premium 500g', price: 172, mrp: 200, category: 'beverages', unit: 'pack', stock: 25 },
      { name: 'Surf Excel 1kg', price: 192, mrp: 220, category: 'household', unit: 'kg', stock: 20 },
    ].map(p => ({ ...p, vendor: admin._id }));

    await Product.insertMany(products);

    await Restaurant.create({
      name: 'Doraha Dhaba', owner: admin._id,
      cuisine: ['Punjabi', 'North Indian'],
      address: { street: 'Main Bazar', area: 'Doraha Mandi', city: 'Doraha, Ludhiana' },
      phone: '9876100001', rating: 4.6, deliveryTime: '25-35 min', deliveryFee: 20,
      menu: [
        { name: 'Dal Makhani', price: 160, category: 'Main Course', isVeg: true },
        { name: 'Butter Chicken', price: 240, category: 'Main Course', isVeg: false },
        { name: 'Lassi Sweet', price: 55, category: 'Drinks', isVeg: true },
      ]
    });

    res.json({
      success: true,
      message: '🎉 Database seeded! Ab yeh URL dobara mat kholo.',
      credentials: {
        admin: '9999999999 / admin123',
        customer: '9876500001 / user123',
        driver: '9876543210 / user123',
        vendor: '9876500002 / user123',
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('MongoDB Connected ✅'); app.listen(process.env.PORT, () => console.log('Server on port ' + process.env.PORT)); })
  .catch(err => console.error('DB Error:', err));
