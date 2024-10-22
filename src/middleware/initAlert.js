const { ethers } = require("ethers");
const User = require("../models/user.js");
const makePhoneCall = require("./makePhone");
const makeSms = require("./makeSms");
const makeMail = require("./makeEmail");

// WebSocket provider
const provider = new ethers.providers.WebSocketProvider(
	process.env.POLYGON_WEBSOCKET_RPC
);

// Smart contract ABI and address
const contractABI = [
	"event Transfer(address indexed from, address indexed to, uint256 value)",
];
const contractAddress = "0xb15C0fC81dd4E04d2477A1eeF9E9AF8B2990ea49";
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Shared object to store user subscriptions
const userSubscriptions = {};

// Function to initialize and restart alert services when the server starts
const initializeAlerts = async () => {
	try {
		const alerts = await User.find({ isAlertOn: true }); // Fetch all enabled alerts from MongoDB

		alerts.forEach((alert) => {
			const { alertAddress, name, email, phoneNumber, alertType } = alert;

			// Listener function specific to the user's address
			const listener = (from, to, value, event) => {
				console.log("=============================");
				console.log(
					`Transaction detected for address ${alertAddress} - value: ${value.toString()}`
				);
				console.log("alertAddress:", alertAddress);
				console.log("Name:", name);
				console.log("Email:", email);
				console.log("phoneNumber:", phoneNumber);
				console.log("=============================");

				const message = `Hello ${name}, a transaction occurred on your address ${alertAddress}. The value transferred is ${value.toString()}.`;

				// Send the alert based on the user's selected alert type(s)
				if (alertType.includes("email")) {
					makeMail(email, name, message);
				}
				if (alertType.includes("sms")) {
					makeSms(phoneNumber, name, message);
				}
				if (alertType.includes("phone")) {
					makePhoneCall(phoneNumber, name, message);
				}
			};

			// Subscribe to the 'Transfer' event of the smart contract for this specific address
			contract.on("Transfer", listener);

			// Store the listener and alert preferences in userSubscriptions
			userSubscriptions[alertAddress] = { listener, alertType };
		});

		console.log("All active alerts have been initialized.");
	} catch (error) {
		console.error("Error initializing alerts:", error);
	}
};

// Export the initialization function and the shared userSubscriptions object
module.exports = {
	initializeAlerts,
	userSubscriptions,
	contract,
};
