require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using Microsoft SMTP server (Office 365, Outlook)

let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // Microsoft SMTP server
    port: 587,                  // Port for TLS
    secure: false,              // Use TLS, so no need for `true` for secure
    auth: {
        user: process.env.EMAIL, // Your Microsoft email
        pass: process.env.EMAIL_PASS,    // Your email password
    },
    tls: {
        ciphers: 'SSLv3'
    }
});


function makeMail(email,name,message){

// Email options
let mailOptions = {
    from: '"Notification" <notifications@meldlens.com>',  // Sender's email address
    to: `${email}`,                   // Recipient's email address
    subject: 'Notification Alert', // Email subject
    text: `${message}`, // Plain text body
    html: `<b>${message}</b>` // HTML body
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Email sent: ' + info.response);
});
}

module.exports = makeMail;
