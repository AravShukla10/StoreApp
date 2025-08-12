// controllers/shopController.js
const Shop = require('../models/Shop');
const Item = require('../models/Item'); // To populate items

// Note: bcrypt is no longer needed here as this controller doesn't handle passwords.

// --- PUBLIC-FACING FUNCTIONS ---

/**
 * @desc    Get all shops for users to browse
 * @route   GET /api/shops
 */
exports.getAllShops = async (req, res) => {
  try {
    // We no longer need to .select('-password') since the field is removed
    const shops = await Shop.find({ isOpen: true }); // Only show open shops
    res.json(shops);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single shop's public profile and its items
 * @route   GET /api/shops/:id
 */
exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate({
        path: 'items',
        // --- FIX: Added 'quantity_avl' to the select string ---
        select: 'name price_per_quantity imageUrl category subcategory quantity_avl',
        populate: [
            { path: 'category', select: 'name' },
            { path: 'subcategory', select: 'name' }
        ]
    });
    
    if (!shop) {
      return res.status(404).json({ msg: 'Shop not found' });
    }
    res.json(shop);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Shop not found' });
    }
    res.status(500).send('Server Error');
  }
};


// --- ADMIN / OWNER PROTECTED FUNCTIONS (Optional) ---
// These functions would be protected by an admin or owner auth middleware.

/**
 * @desc    Update shop information (e.g., name, isOpen status)
 * @route   PUT /api/shops/:id
 * @access  Protected (Admin or Owner)
 */
exports.updateShop = async (req, res) => {
  const { name, isOpen } = req.body;
  const shopFields = {};
  if (name) shopFields.name = name;
  if (typeof isOpen === 'boolean') shopFields.isOpen = isOpen;

  try {
    let shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ msg: 'Shop not found' });
    }
    
    // Authorization check: Ensure the logged-in user is the owner of this shop
    // This assumes your auth middleware attaches the user/owner to req.user
    if (shop.owner.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized to update this shop' });
    }

    shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { $set: shopFields },
      { new: true }
    );

    res.json(shop);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/*
  NOTE: The following functions from your original file have been removed 
  as they are now obsolete with the new Owner-based architecture:

  - exports.registerShop  -> Replaced by registerOwner in ownerController.
  - exports.loginShop     -> Replaced by loginOwner in ownerController.
  - exports.deleteShop    -> This would typically be a super-admin function.
*/
