const express = require ('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const admin = require('firebase-admin'); // 1. Import firebase-admin
const User=require('./models/User');
const Item=require('./models/Item');
const Shop=require('./models/Shop'); // Import the Shop model
const Booking=require('./models/Booking');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const shopRoutes = require('./routes/shopRoutes');
const bookingRoutes = require('./routes/bookingRoutes'); // Import booking routes
const categoryRoutes = require('./routes/categoryRoutes');


const MONGOURI = process.env.URI;
const app = express();

async function connectDB() {
    const connection = await mongoose.connect(MONGOURI);
if(connection)
    console.log("Mongo DB connected successfully!");
}

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/bookings', bookingRoutes); // Use booking routes
app.use('/api/categories', categoryRoutes);

app.listen(5000,()=>{
    console.log("Server is running on 5000");
    connectDB();
});