const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product.js');
const User = require('./src/models/User.js');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/equipora');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const categoryImages = {
  "Cameras & Lenses": [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&q=80&w=800"
  ],
  "Drones & Aerial": [
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1579820010410-c10411aaaa88?auto=format&fit=crop&q=80&w=800"
  ],
  "Audio Equipment": [
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516280440502-85f8c0a8cead?auto=format&fit=crop&q=80&w=800"
  ],
  "Power Tools": [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800"
  ],
  "Lighting & Studio": [
    "https://images.unsplash.com/photo-1585617415174-500b5fc91238?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1521503862198-2ae9a997bbc9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800"
  ],
  "Vehicles & Transport": [
    "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"
  ],
  "IT & Computers": [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800"
  ],
  "Event Supplies": [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800"
  ],
  "Camping & Outdoors": [
    "https://images.unsplash.com/photo-1504280387586-7b4478177d61?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800"
  ],
  "Construction & Heavy": [
    "https://images.unsplash.com/photo-1541888087612-4fb3dcfa89cc?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1504307651254-35680f356f2a?auto=format&fit=crop&q=80&w=800"
  ],
  "Medical Devices": [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800"
  ],
  "Sports & Fitness": [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800"
  ]
};

const fallbackImage = "https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&q=80&w=800";

const seedLarge = async () => {
  try {
    await connectDB();
    
    console.log("Re-seeding database with High-Quality Unsplash Images...");
    
    // Wipe existing products
    await Product.deleteMany({});
    
    const password = 'password123';
    
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

    console.log("Generating Providers...");
    const providerIds = [];
    for (let i = 0; i < 50; i++) {
      const user = await User.findOneAndUpdate(
        { email: `provider${i}@equipora.com` },
        {
          username: `provider_${i}`,
          name: `Provider ${i}`,
          phone: `98765432${i.toString().padStart(2, '0')}`,
          password,
          role: 'user',
          isVerified: true,
          kycStatus: 'ACTIVE',
          trustScore: Math.floor(Math.random() * 10) + 90
        },
        { upsert: true, new: true }
      );
      providerIds.push(user._id);
    }
    
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

    let products = [];
    let count = 0;

    for (const [category, subCategories] of Object.entries(fullCategoriesMap)) {
      const availableImages = categoryImages[category] || [fallbackImage];
      
      for (const subCat of subCategories) {
        // Generate 200 products per subcategory
        for (let i = 1; i <= 200; i++) {
          const provider = providerIds[Math.floor(Math.random() * providerIds.length)];
          const baseImage = availableImages[Math.floor(Math.random() * availableImages.length)];
          
          products.push({
            name: `${subCat} Pro Gear ${i} - Premium Quality`,
            description: `High-quality ${subCat} equipment perfect for professional use. Fully serviced and ready to deploy.`,
            brand: `Brand-${(i % 5) + 1}`,
            model: `${subCat} Mark ${i}`,
            category,
            subCategory: subCat,
            pricePerDay: Math.floor(Math.random() * 4000) + 500,
            securityDeposit: Math.floor(Math.random() * 10000) + 2000,
            location: 'Chennai - Anna Nagar',
            condition: 'Excellent',
            conditionScore: Math.floor(Math.random() * 20) + 80,
            trustScore: Math.floor(Math.random() * 15) + 85,
            verificationStatus: i % 3 === 0 ? 'Verified' : 'Pending',
            owner: provider,
            providerId: provider,
            images: [baseImage, baseImage, baseImage],
            frontImage: baseImage,
            backImage: baseImage,
            leftImage: baseImage,
            rightImage: baseImage,
            topImage: baseImage,
            bottomImage: baseImage,
            status: 'available',
            specifications: {
              Weight: `${(Math.random() * 10).toFixed(1)} kg`,
              Color: 'Black/Silver'
            }
          });
          count++;
          
          if (products.length >= 500) {
            await Product.insertMany(products);
            console.log(`Inserted ${count} products so far...`);
            products = [];
          }
        }
      }
    }

    if (products.length > 0) {
      await Product.insertMany(products);
    }

    console.log(`Successfully completed! Total generated: ${count} beautifully imaged products.`);
    process.exit(0);

  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedLarge();
