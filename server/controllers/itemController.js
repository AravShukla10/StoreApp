// controllers/itemController.js
const Item = require('../models/Item');
const Shop = require('../models/Shop'); // Assuming you have a Shop model
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const cloudinary = require('cloudinary').v2; // Uncommented and now active

// Configure Cloudinary (replace with your actual credentials in .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getAllItems = async (req, res) => {
  try {
    const { category, subcategory, shopId } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (shopId) filter.shopId = shopId;

    const items = await Item.find(filter)
        .populate('category', 'name')
        .populate('subcategory', 'name imageUrl');
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new item
exports.addItem = async (req, res) => {
    try {
        const { name, quantity_avl, price_per_quantity, shopId, category, subcategory } = req.body;
        let imageUrl = req.body.imageUrl; // Will be used if image is uploaded separately or provided
        let imagePublicId = req.body.imagePublicId; // Will be used if image is uploaded separately or provided

        // Validate if shopId is provided
        if (!shopId) {
            return res.status(400).json({ message: 'Shop ID is required to add an item.' });
        }
        if (!category) {
            return res.status(400).json({ message: 'Category ID is required.' });
        }
        if (!subcategory) {
            return res.status(400).json({ message: 'Subcategory ID is required.' });
        }

        // Check if the shop exists
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found.' });
        }


        const categoryExists = await Category.findById(category);
        if (!categoryExists) return res.status(404).json({ message: 'Category not found.' });
        
        const subcategoryExists = await Subcategory.findById(subcategory);
        if (!subcategoryExists) return res.status(404).json({ message: 'Subcategory not found.' });

        // Check for duplicate item within the same shop by name and type
        const existingItem = await Item.findOne({ name, shopId, subcategory });
        if (existingItem) {
            return res.status(409).json({ message: 'An item with this name and type already exists in this shop.' });
        }

        // If an image is sent directly with item creation (e.g., base64 string)
        // This part assumes you'd send base64 in a field like 'imageFile'
        if (req.body.imageFile) {
            try {
                const uploadResult = await cloudinary.uploader.upload(req.body.imageFile, {
                    folder: 'item_images' // Optional: specify a folder in Cloudinary
                });
                imageUrl = uploadResult.secure_url;
                imagePublicId = uploadResult.public_id;
            } catch (uploadError) {
                console.error('Cloudinary upload error during item creation:', uploadError);
                return res.status(500).json({ message: 'Image upload failed.', error: uploadError.message });
            }
        }

        const newItem = new Item({
            name,
            quantity_avl,
            price_per_quantity,
            shopId,
            imageUrl,
            imagePublicId,
            category, // UPDATED
            subcategory, // UPDATED
        });

        const savedItem = await newItem.save();

        // Add the new item's ID to the shop's items array
        shop.items.push(savedItem._id);
        await shop.save();

        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove an item
exports.removeItem = async (req, res) => {
    try {
        const { id } = req.params; // Item ID from URL parameters

        const deletedItem = await Item.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        // Remove the item's ID from the associated shop's items array
        const shop = await Shop.findById(deletedItem.shopId);
        if (shop) {
            shop.items.pull(deletedItem._id);
            await shop.save();
        }

        // If an image was associated, delete it from Cloudinary as well
        if (deletedItem.imagePublicId) {
            await cloudinary.uploader.destroy(deletedItem.imagePublicId);
        }

        res.status(200).json({ message: 'Item deleted successfully.', item: deletedItem });
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update an item (name, type, quantity, but NOT image directly via this route)
// Image updates should go through uploadItemImage or deleteItemImage
exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params; // Item ID from URL parameters
        const { name, quantity_avl, price_per_quantity, category, subcategory } = req.body;

        const updateFields = { name, quantity_avl, price_per_quantity, category, subcategory };
        
        // Remove undefined fields so they don't overwrite existing data
        Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update item quantity (increase/decrease)
exports.updateItemQuantity = async (req, res) => {
    try {
        const { id } = req.params; // Item ID from URL parameters
        const { quantityChange } = req.body; // Positive for increase, negative for decrease

        if (typeof quantityChange !== 'number' || quantityChange === 0) {
            return res.status(400).json({ message: 'Invalid quantity change value.' });
        }

        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        const newQuantity = item.quantity_avl + quantityChange;

        if (newQuantity < 0) {
            return res.status(400).json({ message: 'Quantity cannot be less than zero.' });
        }

        item.quantity_avl = newQuantity;
        const updatedItem = await item.save();

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item quantity:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all items for a specific shop
exports.getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const items = await Item.find({ shopId }).sort({ name: 1 });
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items by shop:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Image Specific Operations ---

// Upload/Update item image
exports.uploadItemImage = async (req, res) => {
    try {
        const { id } = req.params; // Item ID
        const { imageFile } = req.body; // Base64 string of the image

        if (!imageFile) {
            return res.status(400).json({ message: 'Image file (base64) is required.' });
        }

        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        // If an old image exists, delete it from Cloudinary before uploading a new one
        if (item.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(item.imagePublicId);
                console.log(`Deleted old image from Cloudinary: ${item.imagePublicId}`);
            } catch (cloudinaryError) {
                console.error('Cloudinary deletion error for old image:', cloudinaryError);
                // Continue even if old image deletion fails
            }
        }

        // Upload new image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageFile, {
            folder: 'item_images' // Optional: specify a folder
        });

        item.imageUrl = uploadResult.secure_url;
        item.imagePublicId = uploadResult.public_id;
        const updatedItem = await item.save();

        res.status(200).json({ message: 'Item image updated successfully.', item: updatedItem });
    } catch (error) {
        console.error('Error uploading item image:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete item image
exports.deleteItemImage = async (req, res) => {
    try {
        const { id } = req.params; // Item ID

        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        if (!item.imageUrl && !item.imagePublicId) {
            return res.status(404).json({ message: 'No image found for this item to delete.' });
        }

        // Delete image from Cloudinary
        if (item.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(item.imagePublicId);
                console.log(`Deleted image from Cloudinary: ${item.imagePublicId}`);
            } catch (cloudinaryError) {
                console.error('Cloudinary deletion error:', cloudinaryError);
                // Continue with response even if Cloudinary deletion fails
            }
        }

        item.imageUrl = undefined; // Set to undefined to remove the field
        item.imagePublicId = undefined; // Set to undefined to remove the field
        const updatedItem = await item.save();

        res.status(200).json({ message: 'Item image deleted successfully.', item: updatedItem });
    } catch (error) {
        console.error('Error deleting item image:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};