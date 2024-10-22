require('dotenv').config();
const twilio = require('twilio');
// Twilio credentials (replace with your credentials)
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_SID;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio number
const client = new twilio(accountSid, authToken);

const makePhoneCall = (toPhone,name,  message) => {
    client.calls.create({
      to: toPhone, 
      from: twilioPhoneNumber, // Your Twilio phone number
      twiml: `<Response><Say>${message}</Say></Response>` // TwiML to say the message
    })
    .then(call => console.log(`Call made with SID: ${call.sid}`))
    .catch(err => console.error("Twilio Error:", err));
  };

  module.exports = makePhoneCall;