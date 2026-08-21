require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const connectDB = require('./src/utils/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing old data...');
    await User.deleteMany();
    await Product.deleteMany();

    const password = 'password123';

    // 1. Create Core Users
    console.log('Creating users...');
    const admin = await User.create({
      username: 'admin',
      name: 'Equipora Admin',
      email: 'admin@equipora.com',
      phone: '9876543210',
      password,
      role: 'admin',
      isVerified: true,
      kycStatus: 'ACTIVE'
    });

    const provider1 = await User.create({
      username: 'lenslight',
      name: 'Lens & Light Studios',
      email: 'studio@equipora.com',
      phone: '9876543211',
      password,
      role: 'user',
      isVerified: true,
      kycStatus: 'ACTIVE',
      trustScore: 98
    });

    const provider2 = await User.create({
      username: 'skyhigh',
      name: 'SkyHigh Drones',
      email: 'drones@equipora.com',
      phone: '9876543212',
      password,
      role: 'user',
      isVerified: true,
      kycStatus: 'ACTIVE',
      trustScore: 95
    });

    const provider3 = await User.create({
      username: 'buildtech',
      name: 'BuildTech Rentals',
      email: 'tools@equipora.com',
      phone: '9876543213',
      password,
      role: 'user',
      isVerified: true,
      kycStatus: 'ACTIVE',
      trustScore: 92
    });

    // 2. Create Products
    console.log('Seeding rich product data...');
    
    const products = [
      // -----------------------------------------------------
      // CAMERAS
      // -----------------------------------------------------
      {
        providerId: provider1._id,
        name: 'Sony A7S III Master Kit',
        category: 'Cameras',
        subCategory: 'Mirrorless',
        brand: 'Sony',
        model: 'A7S III',
        location: 'Tirunelveli - Sankarnagar',
        specifications: { resolution: '12.1MP', video: '4K 120p', sensor: 'Full-Frame Exmor R' },
        pricePerDay: 4500,
        securityDeposit: 25000,
        description: 'The ultimate 4K video mirrorless camera. Low light beast with insane autofocus. Perfect for weddings, music videos, and cinematic content. Comes with 3 batteries, a dual charger, and a 128GB V90 SD Card.',
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1590483736622-398541ce1ea7?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1621213076840-0254924c8b21?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'SNY-A7S3-001',
        verificationStatus: 'Verified',
        conditionScore: 98,
        trustScore: 99,
        accessories: [{ name: 'Battery (x3)', isPresentAtHandover: true }, { name: '128GB V90 Card', isPresentAtHandover: true }]
      },
      {
        providerId: provider1._id,
        name: 'Canon EOS R5 Professional Body',
        category: 'Cameras',
        subCategory: 'Mirrorless',
        brand: 'Canon',
        model: 'EOS R5',
        location: 'Chennai - Anna Nagar',
        specifications: { resolution: '45MP', video: '8K RAW', stabilization: 'IBIS' },
        pricePerDay: 5000,
        securityDeposit: 30000,
        description: 'Pristine Canon EOS R5 body capable of 8K RAW internal recording. Fantastic for both high-end commercial photography and filmmaking. Excellent condition, cleaned sensor.',
        images: [
          'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1502982720700-bfff97f2ec04?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1603505672907-70e2f5b6190b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1589574519688-6c84f5075c35?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'CAN-R5-998',
        verificationStatus: 'Verified',
        conditionScore: 96,
        trustScore: 97
      },

      // -----------------------------------------------------
      // DRONES
      // -----------------------------------------------------
      {
        providerId: provider2._id,
        name: 'DJI Mavic 3 Pro Cine Premium Combo',
        category: 'Drones',
        subCategory: 'Professional',
        brand: 'DJI',
        model: 'Mavic 3 Pro Cine',
        location: 'Coimbatore - RS Puram',
        specifications: { flightTime: '43 mins', camera: 'Hasselblad Triple', storage: '1TB Built-in SSD' },
        pricePerDay: 8500,
        securityDeposit: 40000,
        description: 'The absolute king of portable drones. Triple camera system including a Hasselblad main sensor. Records Apple ProRes internally. Comes with RC Pro controller and 3 batteries.',
        images: [
          'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1579803815615-120ecaffa02a?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1555543132-72877a28e932?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'DJI-M3P-442',
        verificationStatus: 'Verified',
        conditionScore: 99,
        trustScore: 100,
        accessories: [{ name: 'RC Pro Controller', isPresentAtHandover: true }, { name: 'ND Filter Set', isPresentAtHandover: true }]
      },
      {
        providerId: provider2._id,
        name: 'DJI FPV Explorer Combo',
        category: 'Drones',
        subCategory: 'FPV Racing',
        brand: 'DJI',
        model: 'FPV',
        location: 'Chennai - Velachery',
        specifications: { speed: '140 km/h', range: '10km', goggles: 'V2 included' },
        pricePerDay: 3500,
        securityDeposit: 15000,
        description: 'Experience immersive flight with the DJI FPV drone. Unmatched speed and agility. Includes Goggles V2, standard controller, and motion controller. Ideal for high-speed tracking shots.',
        images: [
          'https://images.unsplash.com/photo-1527011045974-4061a9bc245f?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1582236378418-50608cf9260a?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1522067784013-bc7c5b6b1076?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1552591668-3f5f3e9d8fb2?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'DJI-FPV-118',
        verificationStatus: 'Verified',
        conditionScore: 92,
        trustScore: 94
      },

      // -----------------------------------------------------
      // AUDIO GEAR
      // -----------------------------------------------------
      {
        providerId: provider1._id,
        name: 'Sennheiser MKH 416 Shotgun Mic',
        category: 'Audio Gear',
        subCategory: 'Microphones',
        brand: 'Sennheiser',
        model: 'MKH 416-P48U3',
        location: 'Madurai - K.K. Nagar',
        specifications: { polarPattern: 'Supercardioid/Lobar', response: '40 Hz - 20 kHz' },
        pricePerDay: 1500,
        securityDeposit: 10000,
        description: 'Industry standard shotgun microphone for film and TV production. Exceptional directivity and low noise. Requires 48V phantom power. Comes with blimp and boompole.',
        images: [
          'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1554593539-781e62be556d?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'SEN-416-009',
        verificationStatus: 'AI Checks Passed',
        conditionScore: 90,
        trustScore: 91
      },
      {
        providerId: provider1._id,
        name: 'Rode Wireless GO II Dual',
        category: 'Audio Gear',
        subCategory: 'Microphones',
        brand: 'Rode',
        model: 'Wireless GO II',
        location: 'Tirunelveli - Palayamkottai',
        specifications: { type: 'Wireless Lavalier', range: '200m', recording: 'Internal onboard' },
        pricePerDay: 800,
        securityDeposit: 3000,
        description: 'Ultra-compact dual wireless microphone system. Perfect for vlogging, interviews, and run-and-gun filmmaking. Includes 2 transmitters and 1 receiver with lavalier mics included.',
        images: [
          'https://images.unsplash.com/photo-1629731671954-4a460ba4e4cd?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1605370335035-7ff9d9d300b9?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'ROD-WG2-881',
        verificationStatus: 'Verified',
        conditionScore: 95,
        trustScore: 96
      },

      // -----------------------------------------------------
      // POWER TOOLS
      // -----------------------------------------------------
      {
        providerId: provider3._id,
        name: 'DeWalt 20V MAX Cordless Drill Combo',
        category: 'Power Tools',
        subCategory: 'Drills',
        brand: 'DeWalt',
        model: 'DCK240C2',
        location: 'Trichy - Thillai Nagar',
        specifications: { power: '20V MAX', motor: 'Brushless', items: 'Drill/Driver + Impact' },
        pricePerDay: 400,
        securityDeposit: 1500,
        description: 'Professional grade DeWalt cordless drill and impact driver combo kit. Includes 2 lithium-ion batteries, charger, and a heavy-duty carrying bag. Perfect for home renovations or job sites.',
        images: [
          'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1517420879524-86d64ac2f339?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1581147036324-c189b83b8b6e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1508247076634-1ea15a993739?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'DEW-240-771',
        verificationStatus: 'Verified',
        conditionScore: 85, // Typical for tools
        trustScore: 90
      },
      {
        providerId: provider3._id,
        name: 'Makita 10-Inch Compound Miter Saw',
        category: 'Power Tools',
        subCategory: 'Saws',
        brand: 'Makita',
        model: 'LS1040',
        location: 'Chennai - T Nagar',
        specifications: { bladeSize: '10 Inch', motor: '15 AMP', speed: '4,600 RPM' },
        pricePerDay: 750,
        securityDeposit: 4000,
        description: 'Powerful 15-AMP direct drive motor delivers 4,600 RPM for improved performance. Dual post compound pivot arm. Cuts precisely every time. Blade included.',
        images: [
          'https://images.unsplash.com/photo-1532054942911-30c14c514781?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1621643195232-a9b0c2e47262?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1580920461073-199b5a0cb080?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1581147036437-02fa2d9f45ba?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1588722830843-c0d297920786?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'MAK-SAW-300',
        verificationStatus: 'Verified',
        conditionScore: 88,
        trustScore: 92
      },

      // -----------------------------------------------------
      // LIGHTING
      // -----------------------------------------------------
      {
        providerId: provider1._id,
        name: 'Aputure LS 300x Bi-Color LED Kit',
        category: 'Lighting',
        subCategory: 'Continuous',
        brand: 'Aputure',
        model: 'Light Storm 300x',
        location: 'Coimbatore - Gandhipuram',
        specifications: { power: '300W', temp: '2700K - 6500K', mount: 'Bowens' },
        pricePerDay: 2000,
        securityDeposit: 12000,
        description: 'The Aputure 300x is a bi-color point-source LED. Phenomenal color accuracy (CRI 96). Includes the light head, control box, hyper reflector, and a heavy-duty C-Stand. Essential for pro video.',
        images: [
          'https://images.unsplash.com/photo-1527068589345-b736a7de9cc2?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1603505672907-70e2f5b6190b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1621213076840-0254924c8b21?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1533907650686-70576141c030?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1626245089274-0f156d6f51cc?auto=format&fit=crop&q=80&w=800'
        ],
        serialNumber: 'APT-300X-512',
        verificationStatus: 'Verified',
        conditionScore: 94,
        trustScore: 98,
        accessories: [{ name: 'C-Stand', isPresentAtHandover: true }]
      }
    ];

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} rich products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

seedData();
