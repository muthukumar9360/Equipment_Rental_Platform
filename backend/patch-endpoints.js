const fs = require('fs');

// Add getAllBookings to bookingController
let bc = fs.readFileSync('src/controllers/bookingController.js', 'utf8');
bc = bc.replace(/module\.exports = \{/g, `
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('product', 'name')
      .populate('renter', 'email')
      .populate('provider', 'email');
    res.json(bookings);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  getAllBookings,`);
fs.writeFileSync('src/controllers/bookingController.js', bc);

// Add admin route to bookingRoutes
let br = fs.readFileSync('src/routes/bookingRoutes.js', 'utf8');
br = br.replace(/const \{[\s\S]*?\} = require\('\.\.\/controllers\/bookingController'\);/, 
  (match) => match.replace('}', ', getAllBookings }')
);
br += `\nrouter.get('/admin/all', protect, getAllBookings);\n`;
fs.writeFileSync('src/routes/bookingRoutes.js', br);

// Add refund endpoint to paymentController
let pc = fs.readFileSync('src/controllers/paymentController.js', 'utf8');
pc = pc.replace(/module\.exports = \{/g, `
const refundPayment = async (req, res) => {
  try {
    // In production, initiate Razorpay Refund API here using req.body.bookingId
    res.status(200).json({ message: 'Refund initiated successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  refundPayment,`);
fs.writeFileSync('src/controllers/paymentController.js', pc);

// Add refund route to paymentRoutes
let pr = fs.readFileSync('src/routes/paymentRoutes.js', 'utf8');
pr = pr.replace(/const \{[\s\S]*?\} = require\('\.\.\/controllers\/paymentController'\);/, 
  (match) => match.replace('}', ', refundPayment }')
);
pr += `\nrouter.post('/refund', protect, refundPayment);\n`;
fs.writeFileSync('src/routes/paymentRoutes.js', pr);

console.log('Backend endpoints for admin/returns added');
