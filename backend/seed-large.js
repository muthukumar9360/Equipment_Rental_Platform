require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const connectDB = require('./src/utils/db');

const categories = [
  'Cameras', 'Lenses', 'Drones', 'Lighting', 'Audio', 
  'Tripods', 'Gimbals', 'Laptops', 'Projectors', 'VR Headsets', 
  'Monitors', 'Tablets', 'Gaming Consoles', 'Power Stations', 'Cables & Adapters',
  'Microphones', 'Action Cameras', 'Storage', 'Camera Bags', 'Studio Backdrops'
];

const brands = ['Sony', 'Canon', 'Nikon', 'DJI', 'Apple', 'Rode', 'Sennheiser', 'Zhiyun', 'Anker', 'Samsung', 'GoPro', 'Epson', 'Logitech', 'Manfrotto'];
const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

const generateProducts = async (providerId) => {
  const products = [];
  let index = 1;
  
  for (const category of categories) {
    for (let i = 0; i < 10; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      products.push({
        providerId: providerId,
        name: `Professional ${brand} ${category.slice(0, -1)} Model ${index}`,
        category: category,
        brand: brand,
        model: `Model-${index}`,
        specifications: { weight: `${(Math.random() * 5).toFixed(1)}kg`, color: 'Black' },
        pricePerDay: Math.floor(Math.random() * 150) + 15,
        securityDeposit: Math.floor(Math.random() * 1000) + 100,
        description: `High quality ${category.slice(0, -1)} available for rent. Condition is excellent and ready for professional use. Model ${index} features the latest specs.`,
        images: [`https://picsum.photos/seed/${index}/800/600`],
        serialNumber: `${brand.toUpperCase()}-${Math.floor(Math.random() * 1000000)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        verificationStatus: 'Verified',
        conditionScore: Math.floor(Math.random() * 10) + 90,
        trustScore: Math.floor(Math.random() * 10) + 90,
        accessories: [{ name: 'Carrying Case', isPresentAtHandover: true }]
      });
      index++;
    }
  }
  
  return products;
};

const seedLarge = async () => {
  try {
    await connectDB();
    
    // Find our existing provider from the previous seed
    const provider = await User.findOne({ email: 'provider@equipora.com' });
    if (!provider) {
      console.error("Provider not found. Please run the original seed.js first.");
      process.exit(1);
    }

    // Clear existing products
    await Product.deleteMany({});
    
    console.log(`Generating 200 products across ${categories.length} categories...`);
    const newProducts = await generateProducts(provider._id);
    
    // Insert in batches
    await Product.insertMany(newProducts);
    
    console.log('Successfully seeded 200 products!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedLarge();
