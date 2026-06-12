const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Restaurant = require('./models/Restaurant');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Product.deleteMany({});
  await Restaurant.deleteMany({});

  // Create users
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  const admin = await User.create({
    name: 'Admin', phone: '9999999999', password: adminPass, role: 'admin',
    address: { area: 'Civil Lines', city: 'Ludhiana' }
  });

  const driver = await User.create({
    name: 'Harpreet Driver', phone: '9876543210', password: userPass, role: 'driver',
    vehicle: { type: 'bike', number: 'PB10AB1234', model: 'Honda Activa' },
    isAvailable: true,
    address: { area: 'Model Town', city: 'Ludhiana' }
  });

  const customer = await User.create({
    name: 'Gurpreet Singh', phone: '9876500001', password: userPass, role: 'customer',
    address: { street: 'H.No. 45, Street 3', area: 'Sarabha Nagar', city: 'Ludhiana' }
  });

  console.log('✅ Users created');

  // Create products
  const products = [
    { name: 'Amul Gold Milk 1L', price: 66, mrp: 70, category: 'dairy', unit: 'litre', stock: 50 },
    { name: 'Amul Butter 500g', price: 245, mrp: 265, category: 'dairy', unit: 'pack', stock: 30 },
    { name: 'Paneer Fresh 200g', price: 90, mrp: 100, category: 'dairy', unit: 'pack', stock: 25 },
    { name: 'Tomatoes 1kg', price: 40, mrp: 55, category: 'vegetables', unit: 'kg', stock: 100 },
    { name: 'Onions 1kg', price: 30, mrp: 40, category: 'vegetables', unit: 'kg', stock: 100 },
    { name: 'Potato 2kg', price: 50, mrp: 65, category: 'vegetables', unit: 'kg', stock: 80 },
    { name: 'Spinach (Palak) 500g', price: 25, mrp: 35, category: 'vegetables', unit: 'pack', stock: 40 },
    { name: 'Apple Shimla 1kg', price: 160, mrp: 180, category: 'fruits', unit: 'kg', stock: 30 },
    { name: 'Banana Dozen', price: 50, mrp: 65, category: 'fruits', unit: 'dozen', stock: 50 },
    { name: 'Basmati Rice 5kg', price: 350, mrp: 420, category: 'grains', unit: 'kg', stock: 20 },
    { name: 'Toor Dal 1kg', price: 120, mrp: 140, category: 'grains', unit: 'kg', stock: 35 },
    { name: 'Wheat Atta 10kg', price: 380, mrp: 420, category: 'grains', unit: 'kg', stock: 15 },
    { name: 'Maggi Noodles 12-pack', price: 120, mrp: 144, category: 'snacks', unit: 'pack', stock: 40 },
    { name: 'Kurkure 50g', price: 20, mrp: 20, category: 'snacks', unit: 'piece', stock: 100 },
    { name: 'Tata Tea Premium 500g', price: 175, mrp: 200, category: 'beverages', unit: 'pack', stock: 25 },
    { name: 'Bisleri 1L x6', price: 90, mrp: 100, category: 'beverages', unit: 'pack', stock: 30 },
    { name: 'Surf Excel 1kg', price: 195, mrp: 220, category: 'household', unit: 'kg', stock: 20 },
    { name: 'Dettol Soap 3-pack', price: 90, mrp: 105, category: 'personal_care', unit: 'pack', stock: 30 },
  ].map(p => ({ ...p, vendor: admin._id }));

  await Product.insertMany(products);
  console.log('✅ Products created');

  // Create restaurants
  await Restaurant.create({
    name: 'Punjabi Dhaba', owner: admin._id,
    cuisine: ['Punjabi', 'North Indian'],
    address: { street: 'Near Clock Tower', area: 'Sadar Bazar', city: 'Ludhiana' },
    phone: '9876100001', rating: 4.5, deliveryTime: '30-40 min', deliveryFee: 20,
    menu: [
      { name: 'Dal Makhani', price: 180, category: 'Main Course', isVeg: true },
      { name: 'Butter Chicken', price: 260, category: 'Main Course', isVeg: false },
      { name: 'Paneer Butter Masala', price: 220, category: 'Main Course', isVeg: true },
      { name: 'Tandoori Roti', price: 20, category: 'Bread', isVeg: true },
      { name: 'Naan', price: 30, category: 'Bread', isVeg: true },
      { name: 'Lassi Sweet', price: 60, category: 'Drinks', isVeg: true },
      { name: 'Raita', price: 50, category: 'Sides', isVeg: true },
    ]
  });

  await Restaurant.create({
    name: 'Burger Point Ludhiana', owner: admin._id,
    cuisine: ['Burgers', 'Fast Food', 'Shakes'],
    address: { street: 'Model Town Main Market', area: 'Model Town', city: 'Ludhiana' },
    phone: '9876100002', rating: 4.2, deliveryTime: '20-30 min', deliveryFee: 15,
    menu: [
      { name: 'Veg Burger', price: 120, category: 'Burgers', isVeg: true },
      { name: 'Aloo Tikki Burger', price: 100, category: 'Burgers', isVeg: true },
      { name: 'Chicken Burger', price: 160, category: 'Burgers', isVeg: false },
      { name: 'French Fries (L)', price: 80, category: 'Sides', isVeg: true },
      { name: 'Cold Coffee', price: 90, category: 'Drinks', isVeg: true },
      { name: 'Chocolate Shake', price: 110, category: 'Drinks', isVeg: true },
    ]
  });

  await Restaurant.create({
    name: 'Momos Express', owner: admin._id,
    cuisine: ['Chinese', 'Momos', 'Tibetan'],
    address: { area: 'Dugri', city: 'Ludhiana' },
    phone: '9876100003', rating: 4.4, deliveryTime: '20-30 min', deliveryFee: 15,
    menu: [
      { name: 'Steamed Veg Momos (8pc)', price: 80, category: 'Momos', isVeg: true },
      { name: 'Fried Chicken Momos (8pc)', price: 120, category: 'Momos', isVeg: false },
      { name: 'Manchurian (Veg)', price: 140, category: 'Main', isVeg: true },
      { name: 'Noodles', price: 100, category: 'Main', isVeg: true },
    ]
  });

  console.log('✅ Restaurants created');
  console.log('\n🎉 Database seeded successfully!');
  console.log('--- Login Credentials ---');
  console.log('Admin:    9999999999 / admin123');
  console.log('Customer: 9876500001 / user123');
  console.log('Driver:   9876543210 / user123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
