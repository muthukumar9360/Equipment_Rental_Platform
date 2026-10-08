require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const connectDB = require('./src/utils/db');

// Vocabulary for procedural category generation
const adjectives = ['Industrial', 'Commercial', 'Professional', 'Advanced', 'Medical', 'Scientific', 'Heavy', 'Light', 'Precision', 'Consumer', 'Creative', 'Digital', 'Analog', 'Vintage', 'Modern', 'Smart', 'Automated', 'Portable', 'Stationary', 'Outdoor', 'Indoor', 'Marine', 'Aviation', 'Agricultural', 'Construction'];
const nouns = ['Equipment', 'Machinery', 'Tools', 'Devices', 'Instruments', 'Systems', 'Robotics', 'Hardware', 'Apparatus', 'Vehicles', 'Gear', 'Motors', 'Engines', 'Sensors', 'Controllers'];

// Vocabulary for subcategories
const subcatModifiers = ['Standard', 'Pro', 'Max', 'Ultra', 'Series 1', 'Series 2', 'Series 3', 'Series X', 'Gen 1', 'Gen 2', 'Compact', 'Full Size', 'Heavy Duty', 'Lightweight', 'Wireless', 'Wired', 'Battery Powered', 'Electric', 'Gas Powered', 'Hydraulic', 'Pneumatic', 'Manual', 'Automatic', 'Semi-Automatic', 'Digital', 'Analog', 'Hybrid', 'Eco', 'Premium', 'Basic'];

const brands = ['Sony', 'Canon', 'Nikon', 'DJI', 'Apple', 'Rode', 'Sennheiser', 'DeWalt', 'Makita', 'Aputure', 'Godox', 'Ford', 'Toyota', 'Bosch', 'Hitachi', 'Panasonic', 'Yamaha', 'Honda', 'Caterpillar', 'John Deere'];
const locations = [
  'Tirunelveli - Sankarnagar', 'Tirunelveli - Karungulam', 'Tirunelveli - Palayamkottai', 'Tirunelveli - Town',
  'Chennai - Anna Nagar', 'Chennai - T Nagar', 'Chennai - Velachery',
  'Madurai - K.K. Nagar', 'Madurai - Anna Nagar',
  'Coimbatore - Gandhipuram', 'Coimbatore - RS Puram',
  'Trichy - Srirangam', 'Trichy - Thillai Nagar'
];

// Reusable image pool
const fallbackImages = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1502982720700-bfff97f2ec04?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1589574519688-6c84f5075c35?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1590483736622-398541ce1ea7?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1621213076840-0254924c8b21?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=1200'
];

const getRandomImages = () => {
  return [...fallbackImages].sort(() => 0.5 - Math.random());
};

const seedLarge = async () => {
  try {
    await connectDB();
    
    console.log("Appending large dataset to Database...");
    
    const password = 'password123';
    
    // 1. Generate Admin User
    console.log("Generating Admin user...");
    await User.findOneAndUpdate(
      { email: 'admin@equipora.com' },
      {
        username: 'admin',
        name: 'Super Admin',
        phone: '9999999999',
        password: password,
        role: 'admin',
        isVerified: true,
        kycStatus: 'ACTIVE'
      },
      { upsert: true, new: true }
    );
    

    console.log("Generating 50 random authors/providers...");
    const providerIds = [];
    for (let i = 0; i < 50; i++) {
      const user = await User.create({
        username: `provider_${i}`,
        name: `Provider ${i}`,
        email: `provider${i}@equipora.com`,
        phone: `98765432${i.toString().padStart(2, '0')}`,
        password,
        role: 'user',
        isVerified: true,
        kycStatus: 'ACTIVE',
        trustScore: Math.floor(Math.random() * 10) + 90
      });
      providerIds.push(user._id);
    }
    
    // 3. Use standard Expanded Categories and Subcategories
    const fullCategoriesMap = {
      "Cameras & Lenses": ["DSLR", "Mirrorless", "Cinema", "Action Cams", "360 Cameras", "Lenses", "Tripods"],
      "Drones & Aerial": ["Photography", "FPV Racing", "Enterprise", "Underwater", "Accessories"],
      "Audio Equipment": ["Microphones", "Mixers", "Speakers", "Recorders", "Headphones", "PA Systems"],
      "Power Tools": ["Drills", "Saws", "Generators", "Sanders", "Compressors", "Nail Guns"],
      "Lighting & Studio": ["Continuous", "Strobes", "Modifiers", "Stands", "Backdrops"],
      "Vehicles & Transport": ["Vans", "Trucks", "Trailers", "ATVs", "Utility Carts"],
      "IT & Computers": ["Laptops", "Desktops", "Monitors", "Networking", "Servers", "Tablets"],
      "Event Supplies": ["Tents", "Tables", "Chairs", "Decorations", "Stages", "Heaters"],
      "Camping & Outdoors": ["Tents", "Sleeping Bags", "Backpacks", "Cooking Gear", "Navigation"],
      "Construction & Heavy": ["Excavators", "Loaders", "Scaffolding", "Concrete Mixers", "Jackhammers"],
      "Medical Devices": ["Monitors", "Wheelchairs", "Beds", "Ventilators", "Mobility Scooters"],
      "Sports & Fitness": ["Treadmills", "Weights", "Bicycles", "Kayaks", "Golf Clubs", "Surfboards"]
    };
    
    const categoriesList = Object.keys(fullCategoriesMap);

    let products = [];
    let index = 1;
    let totalInserted = 0;

    console.log(`Generating products for ${categoriesList.length} categories...`);

    for (const category of categoriesList) {
      const subCategories = fullCategoriesMap[category];
      
      for (const subCat of subCategories) {
        // 20 base models per subcategory * 9 providers = 180 products per subcategory
        for (let i = 0; i < 20; i++) {
          const brand = brands[Math.floor(Math.random() * brands.length)];
          const baseModel = `${brand}-${index}X`;
          const baseName = `${brand} ${subCat} Model ${index}`;
          
          // Generate real-looking images from loremflickr based on category keywords
          const searchKeyword = category.split(' ')[0].toLowerCase().replace('&', '');
          const baseImages = [
            `https://loremflickr.com/800/600/${searchKeyword}?lock=${Math.floor(Math.random() * 100000)}`,
            `https://loremflickr.com/800/600/${searchKeyword}?lock=${Math.floor(Math.random() * 100000)}`,
            `https://loremflickr.com/800/600/${searchKeyword}?lock=${Math.floor(Math.random() * 100000)}`,
            `https://loremflickr.com/800/600/${searchKeyword}?lock=${Math.floor(Math.random() * 100000)}`,
            `https://loremflickr.com/800/600/${searchKeyword}?lock=${Math.floor(Math.random() * 100000)}`,
            `https://loremflickr.com/800/600/${searchKeyword}?lock=${Math.floor(Math.random() * 100000)}`
          ];
          
          const shuffledProviders = [...providerIds].sort(() => 0.5 - Math.random());
          const authors = shuffledProviders.slice(0, 9);
          
          for (let j = 0; j < 9; j++) {
            products.push({
              providerId: authors[j],
              name: baseName,
              category: category,
              subCategory: subCat,
              brand: brand,
              model: baseModel,
              specifications: { weight: `${(Math.random() * 5).toFixed(1)}kg`, color: 'Black' },
              condition: 'Like New',
              pricePerDay: Math.floor(Math.random() * 4500) + 500,
              securityDeposit: Math.floor(Math.random() * 20000) + 5000,
              description: `High quality ${subCat.toLowerCase()} equipment available for rent. Condition is excellent.`,
              images: baseImages,
              frontImage: baseImages[0],
              backImage: baseImages[1],
              leftImage: baseImages[2],
              rightImage: baseImages[3],
              topImage: baseImages[4],
              bottomImage: baseImages[5],
              serialNumber: `${brand.toUpperCase()}-${Math.floor(Math.random() * 1000000)}`,
              location: locations[Math.floor(Math.random() * locations.length)],
              verificationStatus: 'Verified',
              conditionScore: Math.floor(Math.random() * 10) + 90,
              trustScore: Math.floor(Math.random() * 10) + 90,
              accessories: [{ name: 'Carrying Case', isPresentAtHandover: true }]
            });
          }
          index++;
        }
      }
      
      // Batch insert every category to prevent memory crash (360 products per batch)
      if (products.length >= 1000) {
        await Product.insertMany(products);
        totalInserted += products.length;
        console.log(`Inserted ${totalInserted} products so far...`);
        products = [];
      }
    }
    
    // Insert any remaining products
    if (products.length > 0) {
      await Product.insertMany(products);
      totalInserted += products.length;
    }
    
    console.log(`Successfully seeded ${providerIds.length} random authors and ${totalInserted} rich products!`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedLarge();
