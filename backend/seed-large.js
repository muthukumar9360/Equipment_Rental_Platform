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
const locations = [
  'Tirunelveli - Sankarnagar', 'Tirunelveli - Karungulam', 'Tirunelveli - Palayamkottai', 'Tirunelveli - Town',
  'Chennai - Anna Nagar', 'Chennai - T Nagar', 'Chennai - Velachery',
  'Madurai - K.K. Nagar', 'Madurai - Anna Nagar',
  'Coimbatore - Gandhipuram', 'Coimbatore - RS Puram',
  'Trichy - Srirangam', 'Trichy - Thillai Nagar'
];

const generateProducts = async (providerId) => {
  const products = [];
  let index = 1;
  
  for (const category of categories) {
    const subCategories = ['Premium', 'Standard', 'Professional', 'Compact', 'Entry-Level'];
    
    for (const subCat of subCategories) {
      for (let i = 0; i < 10; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        products.push({
          providerId: providerId,
          name: `${subCat} ${brand} ${category.slice(0, -1)} Model ${index}`,
          category: category,
          subCategory: `${subCat} ${category}`,
          brand: brand,
          model: `Model-${index}`,
          specifications: { weight: `${(Math.random() * 5).toFixed(1)}kg`, color: 'Black' },
          pricePerDay: Math.floor(Math.random() * 4500) + 500,
          securityDeposit: Math.floor(Math.random() * 20000) + 5000,
          description: `High quality ${subCat.toLowerCase()} ${category.slice(0, -1).toLowerCase()} available for rent. Condition is excellent and ready for professional use. Model ${index} features the latest specs.`,
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
    
    console.log(`Generating 1000 products across ${categories.length} categories...`);
    const newProducts = await generateProducts(provider._id);
    
    // Insert in batches
    await Product.insertMany(newProducts);
    
    console.log('Successfully seeded 1000 products!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedLarge();
