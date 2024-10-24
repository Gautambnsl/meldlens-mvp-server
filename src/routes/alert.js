const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { verifyToken } = require("../middleware/verify");
const router = express.Router();
const { userSubscriptions, contract } = require("../middleware/initAlert");
const makeMail = require("../middleware/makeEmail");
const makeSms = require("../middleware/makeSms");
const makePhoneCall = require("../middleware/makePhone");

// Subscribe to the alert service (creates a listener for user's address)
router.post("/sub",verifyToken, async (req, res) => {
	console.log("subAlertService initiated");

	const { userId, alertType, alertAddress } = req.body;

	// Check if the user is already subscribed
	if (userSubscriptions[alertAddress]) {
		return res.status(400).json({ message: "Sorry, Already subscribed." });
	}

	let user = await User.findById(userId);

	if (!user) return res.status(400).json({ message: "no user found" });

	if (user.premiumService == "free")
		return res.status(400).json({ message: "Please sub to premium Service" });

	const { name, phoneNumber, email } = user;

	if (
		!alertAddress ||
		!email ||
		!name ||
		!phoneNumber ||
		!alertType ||
		!alertType.length
	) {
		return res
			.status(400)
			.json({
				message: "Address, name, phone, and alert preferences are required.",
			});
	}

	// if (alertType) user.alertType = alertType;
	// if (alertAddress) user.alertAddress = alertAddress;
	// if (isAlertOn) user.isAlertOn = isAlertOn;
	user.alertType = alertType;
	user.alertAddress = alertAddress;
	user.isAlertOn = true;
	await user.save();

	user.alertType = alertType;
	user.alertAddress = alertAddress;
	user.isAlertOn = true;
	await user.save();

	// Listener function specific to the user's address
	const listener = (from, to, value, event) => {
		console.log("=============================");
		console.log(
			`Transaction detected for address ${alertAddress} - value: ${value.toString()}`
		);
		console.log("Address:", alertAddress);
		console.log("Name:", name);
		console.log("Email:", email);
		console.log("Phone:", phoneNumber);
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

	res.json({ message: "Successfully subscribed to alert service." });
});

// Unsubscribe from the alert service (removes the listener for the user's address)
router.post("/unsub",verifyToken, async (req, res) => {
	console.log("unsubAlertService initiated");

	const { userId } = req.body;

	let user = await User.findById(userId);
	if (!user) return res.status(400).json({ message: "no user found" });

	const { alertAddress } = user;

	if (!alertAddress || !userSubscriptions[alertAddress]) {
		return res
			.status(400)
			.json({ message: "Not subscribed or invalid address." });
	}

	// Remove the event listener for this user's address
	contract.off("Transfer", userSubscriptions[alertAddress].listener);

	// Remove from the userSubscriptions object
	delete userSubscriptions[alertAddress];



	user.alertType = [""];
	user.alertAddress = "";
	user.isAlertOn = false;
	await user.save();

	res.json({ message: "Unsubscribed successfully." });
});

module.exports = router;
