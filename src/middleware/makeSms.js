require('dotenv').config();
const twilio = require('twilio');
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);


function makeSms(phone,name,message){ 

    client.messages.create({
        body: `${message}`,
        to: phone, // recipient phone number
        from: process.env.TWILIO_PHONE_NUMBER // your Twilio phone number
    })
    .then((message) => console.log(message.sid))
    .catch((error) => console.error(error));
}

module.exports = makeSms;