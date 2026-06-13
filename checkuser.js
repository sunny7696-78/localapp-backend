const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://pk0939865_db_user:Sunny7696@cluster0.wiflb6b.mongodb.net/localapp?appName=Cluster0';

const userSchema = new mongoose.Schema({
  name: String, phone: String, password: String, role: String
});
const User = mongoose.model('User', userSchema);

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected!');
  
  const users = await User.find({});
  console.log('Total users in DB:', users.length);
  
  if (users.length === 0) {
    console.log('NO USERS FOUND - seed nahi hua!');
    process.exit();
  }
  
  users.forEach(u => console.log(`- ${u.phone} | ${u.role} | pass_hash: ${u.password?.slice(0,20)}...`));
  
  // Test password match
  const admin = await User.findOne({ phone: '9999999999' });
  if (admin) {
    const match = await bcrypt.compare('admin123', admin.password);
    console.log('\nAdmin password match:', match);
  }
  
  process.exit();
}

check().catch(e => { console.error(e.message); process.exit(); });
