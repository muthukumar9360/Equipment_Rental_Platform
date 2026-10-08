const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/equipora').then(async () => {
  const User = require('./src/models/User.js');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);
  
  const res = await User.updateMany(
    { password: 'password123' },
    { $set: { password: hash } }
  );
  
  console.log('Updated users:', res.modifiedCount);
  process.exit(0);
});
