
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
 
  // FIX: Plain text password do — model apne aap hash karega
  const admin = await User.create({ name: 'Admin', phone: '9999999999', password: 'admin123', role: 'admin', address: { area: 'Doraha Mandi', city: 'Doraha, Ludhiana' } });
  await User.create({ name: 'Harpreet Driver', phone: '9876543210', password: 'user123', role: 'driver', vehicle: { type: 'bike', number: 'PB10AB1234', model: 'Honda Activa' }, isAvailable: true, address: { area: 'Doraha Bus Stand', city: 'Doraha' } });
  await User.create({ name: 'Gurpreet Singh', phone: '9876500001', password: 'user123', role: 'customer', address: { street: 'H.No. 45, Gali 3', area: 'Doraha Mandi', city: 'Doraha, Ludhiana' } });
  await User.create({ name: 'Sharma Store', phone: '9876500002', password: 'user123', role: 'vendor', address: { street: 'Main Market', area: 'Doraha Mandi', city: 'Doraha' } });
 
  console.log('✅ Users created');
 
  const products = [
    { name: 'Amul Gold Milk 1L', price: 66, mrp: 70, category: 'dairy', unit: 'litre', stock: 50 },
    { name: 'Amul Butter 500g', price: 245, mrp: 265, category: 'dairy', unit: 'pack', stock: 30 },
    { name: 'Paneer Fresh 200g', price: 90, mrp: 100, category: 'dairy', unit: 'pack', stock: 25 },
    { name: 'Dahi 400g', price: 40, mrp: 45, category: 'dairy', unit: 'pack', stock: 40 },
    { name: 'Tamatar 1kg', price: 35, mrp: 45, category: 'vegetables', unit: 'kg', stock: 100 },
    { name: 'Pyaaz 1kg', price: 28, mrp: 35, category: 'vegetables', unit: 'kg', stock: 100 },
    { name: 'Aloo 2kg', price: 48, mrp: 60, category: 'vegetables', unit: 'kg', stock: 80 },
    { name: 'Palak 500g', price: 22, mrp: 30, category: 'vegetables', unit: 'pack', stock: 40 },
    { name: 'Gobhi (Cauliflower)', price: 30, mrp: 40, category: 'vegetables', unit: 'piece', stock: 30 },
    { name: 'Seb (Apple) 1kg', price: 150, mrp: 180, category: 'fruits', unit: 'kg', stock: 30 },
    { name: 'Kela (Banana) dozen', price: 45, mrp: 60, category: 'fruits', unit: 'dozen', stock: 50 },
    { name: 'Basmati Chawal 5kg', price: 340, mrp: 400, category: 'grains', unit: 'kg', stock: 20 },
    { name: 'Toor Dal 1kg', price: 115, mrp: 135, category: 'grains', unit: 'kg', stock: 35 },
    { name: 'Gehun Atta 10kg', price: 375, mrp: 420, category: 'grains', unit: 'kg', stock: 15 },
    { name: 'Chana Dal 1kg', price: 95, mrp: 110, category: 'grains', unit: 'kg', stock: 30 },
    { name: 'Sarson Ka Tel 1L', price: 185, mrp: 210, category: 'grains', unit: 'litre', stock: 25 },
    { name: 'Maggi 12-pack', price: 118, mrp: 144, category: 'snacks', unit: 'pack', stock: 40 },
    { name: 'Kurkure 50g', price: 20, mrp: 20, category: 'snacks', unit: 'piece', stock: 100 },
    { name: 'Haldiram Mixture', price: 55, mrp: 65, category: 'snacks', unit: 'pack', stock: 30 },
    { name: 'Tata Tea Premium 500g', price: 172, mrp: 200, category: 'beverages', unit: 'pack', stock: 25 },
    { name: 'Bisleri 1L x6', price: 88, mrp: 100, category: 'beverages', unit: 'pack', stock: 30 },
    { name: 'Surf Excel 1kg', price: 192, mrp: 220, category: 'household', unit: 'kg', stock: 20 },
    { name: 'Vim Bar 3-pack', price: 45, mrp: 55, category: 'household', unit: 'pack', stock: 40 },
    { name: 'Dettol Soap 3-pack', price: 88, mrp: 105, category: 'personal_care', unit: 'pack', stock: 30 },
  ].map(p => ({ ...p, vendor: admin._id }));
 
  await Product.insertMany(products);
  console.log('✅ Products created (Doraha specific)');
 
  await Restaurant.create({
    name: 'Doraha Dhaba', owner: admin._id,
    cuisine: ['Punjabi', 'North Indian', 'Dal Makhani'],
    address: { street: 'Main Bazar', area: 'Doraha Mandi', city: 'Doraha, Ludhiana' },
    phone: '9876100001', rating: 4.6, deliveryTime: '25-35 min', deliveryFee: 20,
    menu: [
      { name: 'Dal Makhani', price: 160, category: 'Main Course', isVeg: true },
      { name: 'Butter Chicken', price: 240, category: 'Main Course', isVeg: false },
      { name: 'Paneer Butter Masala', price: 200, category: 'Main Course', isVeg: true },
      { name: 'Sarson Da Saag', price: 140, category: 'Main Course', isVeg: true },
      { name: 'Makki Di Roti', price: 25, category: 'Bread', isVeg: true },
      { name: 'Tandoori Roti', price: 18, category: 'Bread', isVeg: true },
      { name: 'Lassi Sweet', price: 55, category: 'Drinks', isVeg: true },
      { name: 'Chawal', price: 60, category: 'Rice', isVeg: true },
    ]
  });
 
  await Restaurant.create({
    name: 'Sharma Fast Food', owner: admin._id,
    cuisine: ['Burger', 'Momos', 'Chowmein', 'Fast Food'],
    address: { street: 'Bus Stand Road', area: 'Doraha Bus Stand', city: 'Doraha, Ludhiana' },
    phone: '9876100002', rating: 4.3, deliveryTime: '15-25 min', deliveryFee: 15,
    menu: [
      { name: 'Veg Burger', price: 80, category: 'Burgers', isVeg: true },
      { name: 'Chicken Burger', price: 120, category: 'Burgers', isVeg: false },
      { name: 'Veg Momos (8pc)', price: 70, category: 'Momos', isVeg: true },
      { name: 'Chicken Momos (8pc)', price: 100, category: 'Momos', isVeg: false },
      { name: 'Veg Chowmein', price: 80, category: 'Chinese', isVeg: true },
      { name: 'Chicken Chowmein', price: 110, category: 'Chinese', isVeg: false },
      { name: 'French Fries', price: 60, category: 'Sides', isVeg: true },
      { name: 'Cold Drink', price: 30, category: 'Drinks', isVeg: true },
    ]
  });
 
  await Restaurant.create({
    name: 'Sidhwan Sweets', owner: admin._id,
    cuisine: ['Mithai', 'Samosa', 'Kachori', 'Chai'],
    address: { street: 'Main Road', area: 'Sidhwan Bet', city: 'Doraha, Ludhiana' },
    phone: '9876100003', rating: 4.5, deliveryTime: '20-30 min', deliveryFee: 10,
    menu: [
      { name: 'Samosa (2pc)', price: 20, category: 'Snacks', isVeg: true },
      { name: 'Kachori (2pc)', price: 25, category: 'Snacks', isVeg: true },
      { name: 'Gulab Jamun (4pc)', price: 40, category: 'Mithai', isVeg: true },
      { name: 'Jalebi 250g', price: 60, category: 'Mithai', isVeg: true },
      { name: 'Barfi 250g', price: 120, category: 'Mithai', isVeg: true },
      { name: 'Chai', price: 15, category: 'Drinks', isVeg: true },
    ]
  });
 
  await Restaurant.create({
    name: 'Doraha Chaat Corner', owner: admin._id,
    cuisine: ['Chaat', 'Golgappe', 'Tikki', 'Street Food'],
    address: { street: 'Grain Market', area: 'Doraha Grain Market', city: 'Doraha, Ludhiana' },
    phone: '9876100004', rating: 4.7, deliveryTime: '15-20 min', deliveryFee: 15,
    menu: [
      { name: 'Golgappe (10pc)', price: 40, category: 'Chaat', isVeg: true },
      { name: 'Aloo Tikki (2pc)', price: 50, category: 'Chaat', isVeg: true },
      { name: 'Bhel Puri', price: 55, category: 'Chaat', isVeg: true },
      { name: 'Papdi Chaat', price: 70, category: 'Chaat', isVeg: true },
      { name: 'Dahi Bhalle', price: 80, category: 'Chaat', isVeg: true },
    ]
  });
 
  console.log('✅ Restaurants created (Doraha)');
  console.log('\n🎉 Database seeded for DORAHA!');
  console.log('--- Login Credentials ---');
  console.log('Admin:    9999999999 / admin123');
  console.log('Customer: 9876500001 / user123');
  console.log('Driver:   9876543210 / user123');
  console.log('Vendor:   9876500002 / user123');
  process.exit(0);
}
 
seed().catch(err => { console.error(err); process.exit(1); });
 