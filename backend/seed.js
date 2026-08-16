require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const connectDB = require('./src/utils/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@equipora.com',
      password,
      role: 'admin',
      isVerified: true,
      kycStatus: 'Fully Verified'
    });

    // Create Provider
    const provider = await User.create({
      name: 'Jane Provider',
      email: 'provider@equipora.com',
      password,
      role: 'provider',
      isVerified: true,
      kycStatus: 'Fully Verified',
      trustScore: 95
    });

    // Create Renter
    const renter = await User.create({
      name: 'John Renter',
      email: 'renter@equipora.com',
      password,
      role: 'renter',
      isVerified: false,
      kycStatus: 'Basic Verified'
    });

    // Create Sample Products
    await Product.create([
      {
        providerId: provider._id,
        name: 'Sony A7III Mirrorless Camera',
        category: 'Camera',
        brand: 'Sony',
        model: 'A7III',
        specifications: { megapixel: '24.2', sensor: 'Full Frame' },
        pricePerDay: 45,
        securityDeposit: 500,
        description: 'Excellent condition Sony A7III with kit lens.',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'],
        serialNumber: 'SNY-12345678',
        verificationStatus: 'Verified',
        conditionScore: 98,
        accessories: [{ name: 'Battery', isPresentAtHandover: true }, { name: 'Charger', isPresentAtHandover: true }]
      },
      {
        providerId: provider._id,
        name: 'DJI Mavic 3 Pro',
        category: 'Drone',
        brand: 'DJI',
        model: 'Mavic 3 Pro',
        specifications: { maxFlightTime: '43 mins', camera: 'Hasselblad' },
        pricePerDay: 75,
        securityDeposit: 1000,
        description: 'Professional drone with 3 cameras. Low flight hours.',
        images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800'],
        serialNumber: 'DJI-98765432',
        verificationStatus: 'Pending',
        conditionScore: 100,
        accessories: [{ name: 'Controller', isPresentAtHandover: false }]
      }
    ]);

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

seedData();
