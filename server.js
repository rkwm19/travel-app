// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 2. Define User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// ... (User Schema is above here) ...

// 1. Define Booking Schema
const BookingSchema = new mongoose.Schema({
    email: { type: String, required: true },
    tripTitle: { type: String, required: true },
    price: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

// ... (Login/Register APIs are here) ...

// 2. Add Booking APIs
app.post('/api/book', async (req, res) => {
    try {
        const { email, tripTitle, price } = req.body;
        const newBooking = new Booking({ email, tripTitle, price });
        await newBooking.save();
        res.status(201).json({ message: "Trip booked successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Booking failed" });
    }
});

app.get('/api/my-bookings', async (req, res) => {
    try {
        const { email } = req.query; // We get email from URL ?email=...
        const bookings = await Booking.find({ email });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch bookings" });
    }
});

// ... (Static file serving remains at the bottom) ...

// 3. API Routes
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const newUser = new User({ email, password });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error registering user" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        res.json({ message: "Login successful", user: user.email });
    } catch (err) {
        res.status(500).json({ error: "Error logging in" });
    }
});

// ... (previous API routes above remain the same)

// 4. DEPLOYMENT CONFIG: Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '/client/dist')));

// FIXED: Use regex /.*/ instead of string '*' to avoid the PathError
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '/client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));