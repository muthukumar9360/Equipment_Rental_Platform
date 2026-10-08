const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/equipora');
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const categoryImages = {
  "Cameras": [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=800"
  ],
  "Drones": [
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800"
  ],
  "Audio": [
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516280440502-85f8c0a8cead?auto=format&fit=crop&q=80&w=800"
  ]
};

const fallbackImage = "https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&q=80&w=800";

const seedSmall = async () => {
  try {
    await connectDB();
    const Product = require('./src/models/Product.js');
    const User = require('./src/models/User.js');
    
    console.log("Wiping existing DB...");
    await Product.deleteMany({});
    await User.deleteMany({}); // Wipe users to ensure clean state
    
    const plainPassword = 'password123';
    console.log("Generating Admin...");
    await User.create({
      username: 'admin_john',
      email: 'admin@equipora.com',
      name: 'John Admin',
      phone: '9999999999',
      password: plainPassword,
      role: 'admin',
      isVerified: true,
      kycStatus: 'ACTIVE'
    });

    console.log("Generating 5 Providers...");
    const providerIds = [];
    const providerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan'];
    
    for (let i = 0; i < 5; i++) {
      const user = await User.create({
        username: `provider_${providerNames[i].toLowerCase()}`,
        name: `${providerNames[i]} Rentals`,
        email: `provider${i}@equipora.com`,
        phone: `987654321${i}`,
        password: plainPassword,
        role: 'user',
        isVerified: true,
        kycStatus: 'ACTIVE',
        trustScore: 90 + i
      });
      providerIds.push(user._id);
    }
    
    // Create one normal customer
    console.log("Generating 1 Customer...");
    await User.create({
      username: 'customer_mike',
      name: 'Mike Customer',
      email: 'mike@equipora.com',
      phone: '9123456789',
      password: plainPassword,
      role: 'user',
      isVerified: true,
      kycStatus: 'ACTIVE'
    });

    const targetCategories = {
      "Cameras & Lenses": ["Mirrorless", "DSLR", "Cinema"],
      "Drones & Aerial": ["Photography", "FPV", "Enterprise"],
      "Audio Equipment": ["Microphones", "Mixers", "Recorders"]
    };

    let products = [];
    let count = 0;

    for (const [category, subCats] of Object.entries(targetCategories)) {
      // Map back to the keys used in categoryImages
      const imageKey = category === "Cameras & Lenses" ? "Cameras" : 
                       category === "Drones & Aerial" ? "Drones" : "Audio";
      const availableImages = categoryImages[imageKey] || [fallbackImage];
      
      for (let i = 1; i <= 10; i++) {
        // Distribute the 10 products among the 3 subcategories
        const subCat = subCats[i % subCats.length];
        
        // Base product details
        const baseName = `${subCat} Pro Gear ${i} - Premium Quality`;
        const baseModel = `${subCat} Mark ${i}`;
        const basePrice = 500 + (i * 100);
        
        // Loop 3 times to create this exact product for 3 different providers
        for (let p = 0; p < 3; p++) {
          const providerIndex = (i + p) % providerIds.length;
          const provider = providerIds[providerIndex];
          
          const extraImages = [
            'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1513251703273-db987b50875e?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=600&q=80'
          ];
          
          // Different main image per provider
          const imgIndex = (i + p) % availableImages.length;
          const baseImage = availableImages[imgIndex];
          
          products.push({
            name: baseName,
            description: `High-quality ${subCat} equipment perfect for professional use. Fully serviced and ready to deploy. Provided by Provider ${providerIndex}.`,
            brand: `Brand-${(i % 5) + 1}`,
            model: baseModel,
            category,
            subCategory: subCat,
            pricePerDay: basePrice + (p * 50), // Slight price variation
            securityDeposit: 2000 + (i * 500),
            location: 'Chennai - Anna Nagar',
            condition: 'Excellent',
            conditionScore: 85 + (i % 15) + p,
            trustScore: 85 + (i % 15) + p,
            verificationStatus: 'Verified',
            owner: provider,
            providerId: provider,
            frontImage: baseImage,
            backImage: extraImages[(i + p) % extraImages.length],
            leftImage: extraImages[(i + p + 1) % extraImages.length],
            rightImage: extraImages[(i + p + 2) % extraImages.length],
            topImage: extraImages[(i + p + 3) % extraImages.length],
            bottomImage: extraImages[(i + p + 4) % extraImages.length],
            status: 'available',
            specifications: {
              Weight: `${(i % 5) + 1} kg`,
              Color: p === 0 ? 'Black' : p === 1 ? 'Silver' : 'Grey'
            }
          });
          count++;
        }
      }
    }

    if (products.length > 0) {
      await Product.insertMany(products);
    }

    console.log(`Successfully completed! Total generated: ${count} products.`);
    process.exit(0);

  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedSmall();
