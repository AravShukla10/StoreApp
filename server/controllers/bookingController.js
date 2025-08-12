const { Expo } = require('expo-server-sdk');
const Booking = require('../models/Booking');
const Item = require('../models/Item');
const Shop = require('../models/Shop');
const User = require('../models/User');
const mongoose = require('mongoose'); // Import Mongoose for transactions

const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
    if (!Expo.isExpoPushToken(pushToken)) {
        console.warn(`Invalid Expo push token provided: ${pushToken}`);
        return;
    }
    const message = {
        to: pushToken,
        sound: "default",
        title: title,
        body: body,
        channelId: "default",
        priority: "high",
        data: data,
    };
    try {
        await expo.sendPushNotificationsAsync([message]);
        console.log(`Push notification sent successfully to token: ${pushToken}`);
    } catch (error) {
        console.error(`Error sending push notification:`, error);
    }
};

// --- UPDATED: createBooking now checks and decrements stock atomically ---
exports.createBooking = async (req, res) => {
    const { userId, shopId, items, notes } = req.body;
    
    // Use a session for database transactions to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!userId || !shopId || !items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Missing required booking information.');
        }

        const userExists = await User.findById(userId).session(session);
        if (!userExists) throw new Error('User not found');

        const shopExists = await Shop.findById(shopId).populate('owner').session(session);
        if (!shopExists) throw new Error('Shop not found');

        let totalAmount = 0;
        const itemsForBooking = [];
        
        // Step 1: Check stock and decrement inventory within the transaction
        for (const item of items) {
            const dbItem = await Item.findById(item.itemId).session(session);
            if (!dbItem) throw new Error(`Item with ID ${item.itemId} not found.`);
            
            // Critical stock check before proceeding
            if (dbItem.quantity_avl < item.quantity) {
                throw new Error(`Sorry, item "${dbItem.name}" does not have enough stock.`);
            }
            
            // Decrement stock immediately to reserve the items
            await Item.findByIdAndUpdate(item.itemId, 
                { $inc: { quantity_avl: -item.quantity } },
                { session }
            );

            totalAmount += dbItem.price_per_quantity * item.quantity;
            itemsForBooking.push({
                itemId: item.itemId,
                quantity: item.quantity,
                price: dbItem.price_per_quantity
            });
        }
        
        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);
        const lastBookingToday = await Booking.findOne({ shopId: shopId, createdAt: { $gte: startOfToday } }).sort({ createdAt: -1 }).session(session);
        let newOrderNumber = (lastBookingToday && typeof lastBookingToday.dailyOrderNumber === 'number') ? lastBookingToday.dailyOrderNumber + 1 : 1;

        // Step 2: Create the booking document
        const newBooking = new Booking({
            userId, shopId, items: itemsForBooking, totalAmount, notes, dailyOrderNumber: newOrderNumber,
        });

        const savedBooking = await newBooking.save({ session });

        userExists.bookings.push(savedBooking._id);
        await userExists.save({ session });

        // If all operations succeed, commit the transaction
        await session.commitTransaction();
        
        if (shopExists.owner && shopExists.owner.expoPushToken) {
            await sendPushNotification(
                shopExists.owner.expoPushToken,
                `New Order #${newOrderNumber} Received! 💰`,
                `You have a new order from ${userExists.name} for ₹${totalAmount.toFixed(2)}.`,
                { orderId: savedBooking._id, type: 'NEW_ORDER' }
            );
        }

        res.status(201).json(savedBooking);

    } catch (err) {
        // If any error occurs, roll back all database changes
        await session.abortTransaction();
        console.error("Error creating booking:", err.message);
        res.status(400).json({ message: err.message || "Server Error" });
    } finally {
        // Always end the session
        session.endSession();
    }
};

// --- UPDATED: updateBookingStatus now handles stock restoration on cancellation ---
exports.updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const booking = await Booking.findById(id).populate('userId', 'pushToken');
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        const oldStatus = booking.status;
        
        // ADDED: Restore stock if a pending or confirmed order is cancelled
        if (status === 'cancelled' && (oldStatus === 'pending' || oldStatus === 'confirmed')) {
            for (const bookedItem of booking.items) {
                await Item.findByIdAndUpdate(bookedItem.itemId, {
                    $inc: { quantity_avl: bookedItem.quantity }
                });
            }
        }
        
        // REMOVED: Stock decrement logic is no longer needed on confirmation
        
        booking.status = status;
        if (status === 'completed' && oldStatus !== 'completed') {
            booking.isCompleted = true;
        }
        const updatedBooking = await booking.save();

        if (booking.userId && booking.userId.pushToken) {
            if (status === 'confirmed') {
                await sendPushNotification(booking.userId.pushToken, 'Order Confirmed! 🎉', 'Your order has been accepted and is being prepared.', { orderId: booking._id });
            } else if (status === 'cancelled') {
                 await sendPushNotification(booking.userId.pushToken, 'Order Cancelled', 'Unfortunately, your recent order has been cancelled.', { orderId: booking._id });
            }
        }
        
        res.json(updatedBooking);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const { userId, shopId, status } = req.query;
        let query = {};
        if (userId) query.userId = userId;
        if (shopId) query.shopId = shopId;
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('userId', 'name phone')
            .populate('shopId', 'name phone')
            .populate('items.itemId', 'name');

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name phone')
            .populate('shopId', 'name phone')
            .populate('items.itemId', 'name');

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(_id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Booking removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};