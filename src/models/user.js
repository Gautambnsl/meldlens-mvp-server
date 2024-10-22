const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  tempAddress: {
    type: String,
    default: '',
  },
  walletAddress: {
    type: String,
    default: '',
  },
  alertAddress: {
    type: String,
    default: '',
  },
  loginCount: {
    type: Number,
    default: 0, // Initializes login count
  },
  visitCount: {
    type: Number,
    default: 0, // Initializes visit count
  },
  premiumService: {
    type: String,
    default: 'free', // Default value when user signs up
  },
  isAlertOn: {
    type: Boolean,
    default: false,  // Default off at signup
  },
	alertType: { 
    type: [String], 
    default: '' }, // Array of alert types (email, sms, phone)
});


UserSchema.pre('save', async function (next) {
  try{
    console.log("working 1")
    if (!this.isModified('password')) return next();
    console.log("working 2")
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("working 3")
  next();
}catch(err){
  console.log(err)
}
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
