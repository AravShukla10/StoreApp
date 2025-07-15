const express = require ('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User=require('./models/User');
const Item=require('./models/Item');
const Shop=require('./models/Shop');
const Booking=require('./models/Booking');
const userRoutes = require('./routes/userRoutes');


const MONGOURI = process.env.URI;const app = express();



async function connectDB() {
    const connection = await mongoose.connect(MONGOURI);
if(connection)
    console.log("Mongo DB connected successfully!");
}

app.use(express.json());
app.use('/api/users', userRoutes);




app.listen(5000,()=>{
    console.log("Server is running on 5000");
    connectDB();
});