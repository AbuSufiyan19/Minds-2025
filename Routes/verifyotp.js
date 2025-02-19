const express = require('express');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const User = require("../models/UserRegister");
require('dotenv').config();


const router = express.Router();

let otpStore = {}; // In-memory store for OTPs (consider using a database in production)

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route to generate and send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email, subject,htmlContent } = req.body;

        const exists = await User.findOne({ email });

        if (exists) {
            console.log('Sending "Already registered" response');
            return res.status(400).json({ message: 'Already registered' });
        }

        const otp = Math.floor(100000 + Math.random()*900000).toString();
        otpStore[email] = otp;

        // Replace {{otp}} placeholder with the actual OTP in the HTML content
        const finalHtmlContent = htmlContent.replace('{{otp}}', otp);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: finalHtmlContent
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email', error });
            }
            res.status(200).json({ message: 'OTP sent successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Route to generate and send OTP for reset password
router.post('/send-otp-password', async (req, res) => {
    try {
        const { email, subject,htmlContent } = req.body;

        const exists = await User.findOne({ email });
        if (!exists) {
              return res.status(400).json({ message: 'Email not available' });
        }

        const otp = Math.floor(100000 + Math.random()*900000).toString();
        otpStore[email] = otp;

        
        // Replace {{otp}} placeholder with the actual OTP in the HTML content
        const finalHtmlContent = htmlContent.replace('{{otp}}', otp).replace('{{User}}',exists.studentName);


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: finalHtmlContent
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email', error });
            }
            res.status(200).json({ message: 'OTP sent successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Route to verify OTP
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).send({ message: 'Email and OTP are required' });
    }

    const storedOtp = otpStore[email];
    if (storedOtp && storedOtp === otp) {
        delete otpStore[email]; // Remove OTP after successful verification
        res.status(200).send({ message: 'OTP verified successfully' });
    } else {
        res.status(200).send({ message: 'Invalid OTP' });
    }
});

module.exports = router;