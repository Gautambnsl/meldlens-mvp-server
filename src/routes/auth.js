const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { verifyToken } = require('../middleware/verify');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, phoneNumber, tempAddress } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      name, 
      email, 
      password, 
    });
    
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("check one")
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    console.log("check two")
    user.loginCount += 1; // Increment login count each time the user logs in
    await user.save();
    console.log("check three")
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // 1 minute token expiration
    });
    console.log("check four")
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch User Data (GET route)
router.get('/user/data', async (req, res) => {
  const {userId} = req.body;
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.visitCount += 1; // Increment visit count
    await user.save(); // Save the updated visit count

    res.json(user); // Return all user data including premiumService, isAlertOn, alertObjects
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Data Route (PUT)
router.post('/user/update', async (req, res) => {
  const { userId , name, email, password, phoneNumber,walletAddress, alertAddress,  tempAddress, premiumService, isAlertOn, alertType } = req.body;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (password) user.password = password;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (walletAddress) user.walletAddress = walletAddress;
    if (tempAddress) user.tempAddress = tempAddress;
    if (premiumService) user.premiumService = premiumService;
    // if (email) user.email = email;
    // if (alertAddress) user.alertAddress = alertAddress;
    // if (isAlertOn) user.isAlertOn = isAlertOn;
    // if (alertType) user.alertType = alertType;

    await user.save();

    res.json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// // Root Update User Data Route (PUT)
// router.put('/user/rootUpdate', async (req, res) => {
//   const userId = req.userId;  // Get the userId from the verified token
//   const { 
//     email, 
//     password, 
//     phoneNumber, 
//     tempAddress, 
//     walletAddress, 
//     name,
//     loginCount, 
//     visitCount ,
//     premiumService,
//     isAlertOn,
//     alertObjects
//   } = req.body;  // Assuming these fields will be passed in request body

//   try {
//     let user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update all fields directly
//     if (email) user.email = email;
//     if (password) user.password = password;  // No need to hash, 'pre-save' will handle it
//     if (phoneNumber) user.phoneNumber = phoneNumber;
//     if (tempAddress) user.tempAddress = tempAddress;
//     if (walletAddress) user.walletAddress = walletAddress;
//     if (name) user.name = name;
//     if (premiumService !== undefined) user.premiumService = premiumService;
//     if (isAlertOn !== undefined) user.isAlertOn = isAlertOn;
//     if (alertObjects !== undefined) user.alertObjects = alertObjects;

//     // Update login and visit counts
//     if (loginCount !== undefined) user.loginCount = loginCount;
//     if (visitCount !== undefined) user.visitCount = visitCount;

//     await user.save();
//     res.json({ message: 'User info updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;
