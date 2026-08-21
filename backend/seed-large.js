require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const connectDB = require('./src/utils/db');
const bcrypt = require('bcryptjs');

const categories = [
  'Cameras', 'Drones', 'Audio Gear', 'Power Tools', 'Lighting', 'Vehicles'
];

const subCategoriesMap = {
  "Cameras": ["DSLR", "Mirrorless", "Cinema", "Action Cams", "360 Cameras"],
  "Drones": ["Photography", "FPV Racing", "Enterprise", "Underwater"],
  "Audio Gear": ["Microphones", "Mixers", "Speakers", "Recorders"],
  "Power Tools": ["Drills", "Saws", "Generators", "Sanders", "Compressors"],
  "Lighting": ["Continuous", "Strobes", "Modifiers", "Stands"],
  "Vehicles": ["Vans", "Trucks", "Trailers", "ATVs"]
};

const brands = ['Sony', 'Canon', 'Nikon', 'DJI', 'Apple', 'Rode', 'Sennheiser', 'DeWalt', 'Makita', 'Aputure', 'Godox', 'Ford', 'Toyota'];
const locations = [
  'Tirunelveli - Sankarnagar', 'Tirunelveli - Karungulam', 'Tirunelveli - Palayamkottai', 'Tirunelveli - Town',
  'Chennai - Anna Nagar', 'Chennai - T Nagar', 'Chennai - Velachery',
  'Madurai - K.K. Nagar', 'Madurai - Anna Nagar',
  'Coimbatore - Gandhipuram', 'Coimbatore - RS Puram',
  'Trichy - Srirangam', 'Trichy - Thillai Nagar'
];

// Pool of static, extremely high-quality Unsplash URLs that are guaranteed to load
const imagePools = {
  'Cameras': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ec04?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1589574519688-6c84f5075c35?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1590483736622-398541ce1ea7?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1621213076840-0254924c8b21?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&q=80&w=1200'
  ],
  'Drones': [
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1579803815615-120ecaffa02a?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1555543132-72877a28e932?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1527011045974-4061a9bc245f?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1582236378418-50608cf9260a?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1522067784013-bc7c5b6b1076?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1552591668-3f5f3e9d8fb2?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&q=80&w=1200'
  ],
  'Audio Gear': [
    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1554593539-781e62be556d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1629731671954-4a460ba4e4cd?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1605370335035-7ff9d9d300b9?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1626017106886-f40c7ff9dc6d?auto=format&fit=crop&q=80&w=1200'
  ],
  'Power Tools': [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1517420879524-86d64ac2f339?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1581147036324-c189b83b8b6e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1508247076634-1ea15a993739?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1532054942911-30c14c514781?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1621643195232-a9b0c2e47262?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1580920461073-199b5a0cb080?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1581147036437-02fa2d9f45ba?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1588722830843-c0d297920786?auto=format&fit=crop&q=80&w=1200'
  ],
  'Lighting': [
    'https://images.unsplash.com/photo-1527068589345-b736a7de9cc2?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1603505672907-70e2f5b6190b?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1621213076840-0254924c8b21?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1533907650686-70576141c030?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1626245089274-0f156d6f51cc?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1629227092928-86866ba47372?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1584283103445-8c7c91a3c72b?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1563588975305-6f16c1ce4999?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1581452934149-bd42fba82833?auto=format&fit=crop&q=80&w=1200'
  ],
  'Vehicles': [
    'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1520113412548-c9c4501a4e10?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1536617637856-7871b86a8775?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1559404094-1a6bc94c35e3?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1502877338535-34cb01156828?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1519222970733-f546218fa6d7?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1506015391300-415214824056?auto=format&fit=crop&q=80&w=1200'
  ]
};

// Helper to reliably get 8 static images by randomly choosing from the category pool
const getRandomImages = (category) => {
  const pool = imagePools[category] || imagePools['Cameras'];
  
  // Shuffle pool to get 8 random images for this specific product
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 8);
};

const seedLarge = async () => {
  try {
    await connectDB();
    
    // Clear existing products and users
    console.log("Clearing Database...");
    await Product.deleteMany({});
    await User.deleteMany({});
    
    const password = 'password123';
    
    // 1. Generate 20 Random Providers
    console.log("Generating 20 random authors/providers...");
    const providerIds = [];
    
    const authorNames = [
      "Alex Morgan", "Sarah Chen", "David Kumar", "Emily Davis", "Michael Chang",
      "Jessica Wong", "Robert Taylor", "Emma Wilson", "Daniel Lee", "Olivia Martin",
      "James Anderson", "Sophia White", "William Harris", "Isabella Clark", "Joseph Lewis",
      "Ava Robinson", "Matthew Walker", "Mia Hall", "Andrew Young", "Charlotte King"
    ];

    for (let i = 0; i < 20; i++) {
      const user = await User.create({
        username: `provider_${i}`,
        name: authorNames[i],
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
    
    console.log(`Generating a large set of rich products...`);
    const products = [];
    let index = 1;
    
    // 2. Generate Products
    for (const category of categories) {
      const subCategories = subCategoriesMap[category] || ['Standard'];
      
      for (const subCat of subCategories) {
        // Let's generate 4 base models per subcategory. For each base model, we create 3 identical products from 3 different authors.
        for (let i = 0; i < 4; i++) {
          const brand = brands[Math.floor(Math.random() * brands.length)];
          const baseModel = `${brand}-${index}X`;
          const baseName = `${brand} ${subCat} Professional Model ${index}`;
          const baseImages = getRandomImages(category);
          
          // Pick 3 unique authors for this same model
          const shuffledProviders = [...providerIds].sort(() => 0.5 - Math.random());
          const authors = shuffledProviders.slice(0, 3);
          
          for (let j = 0; j < 3; j++) {
            products.push({
              providerId: authors[j],
              name: baseName,
              category: category,
              subCategory: subCat,
              brand: brand,
              model: baseModel,
              specifications: { weight: `${(Math.random() * 5).toFixed(1)}kg`, color: 'Black', condition: 'Like New' },
              pricePerDay: Math.floor(Math.random() * 4500) + 500,
              securityDeposit: Math.floor(Math.random() * 20000) + 5000,
              description: `High quality ${subCat.toLowerCase()} equipment available for rent. Hosted by one of our top providers. Condition is excellent and ready for professional use. Fully verified.`,
              images: baseImages, // Same images for same model across different authors
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
    }
    
    // Insert in batches
    console.log(`Inserting ${products.length} products...`);
    await Product.insertMany(products);
    
    console.log(`Successfully seeded ${providerIds.length} random authors and ${products.length} rich products!`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedLarge();
