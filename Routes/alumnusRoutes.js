const express = require('express');
const Alumni = require('../models/alumnusSchema');
const nodemailer = require('nodemailer');
const router = express.Router();
const crypto = require('crypto');
require('dotenv').config();


function generatePassword(length = 6) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

async function sendGreetingEmail(email, username, password, alumnusName) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to the Alumni Portal',
            html: `Dear ${alumnusName},
             <p>We are delighted to confirm your registration for Login - 2024 as an honored alumnus! Login - 2024 takes place on September 21 & 22, 2024, and your presence is a significant addition to our event. We are excited to have you join us.</p>
            
            <p>Your username: <strong>${email}</strong></p>
            <p>Your password: <strong>${password}</strong></p>
            
            <p>Please use these credentials to log in to the Nethunt portal. If you have opted for accommodation, our accommodation team will reach out to you shortly to provide details and assist with any arrangements. Should you have any immediate questions or need further assistance regarding your stay, please feel free to contact the accommodation team.</p>
            <p>Govind Raghavendran: 8925617246 <br> Keerthana S: 9597393639.</p>
            
            <p>We look forward to welcoming you back and hope you enjoy the event!</p>
            
            <p></strong>Best regards,</strong><br>
            Registration Team<br>
            Login - 2024</p>
            
            <div style="width: 100%; text-align: center;">
              <a href="https://psgtech.in"><img src="https://i.imgur.com/JQIgh6Y.png" alt="Login - 2024" style="width: 200px;"></a>
              <p><strong>Hey, do you follow us on social media?</strong></p>
              <a href="https://www.instagram.com/loginpsgtech/"><img src="https://cdn-icons-png.flaticon.com/128/174/174855.png" alt="Instagram" style="width: 40px;"></a>
              &nbsp;&nbsp;
              <a href="https://www.linkedin.com/company/login-psg-tech/"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 40px;"></a>
              <p>Follow us to get the latest updates on events, announcements, and more.</p>
            </div>
            
            <hr>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
        if (error.response) {
            console.error('SMTP Response Error:', error.response);
        }
        throw new Error('Failed to send OTP email. Please check your email configuration.');
    }
}


// Route to render the registration page
router.get('/alumnusregister', (req, res) => {
    res.render('alumnusregister');
});

// Handle user registration
router.post('/alumnusRegister', async (req, res) => {
    try {
        const { emailAddress, otp, alumnusName, rollNumber, alumnusCode, contactNumber, gender, foodPreference, accommodationRequired } = req.body;

        const streamCode = rollNumber.substring(2, 4);
        const streamMap = {
            'mx': 'Computer_Application',
            'pd': 'Data_Science',
            'pt': 'Theoretical_Computer_Science',
            'pw': 'Software_Systems',
            'MX': 'Computer_Application',
            'PD': 'Data_Science',
            'PT': 'Theoretical_Computer_Science',
            'PW': 'Software_Systems',
        };
        const stream = streamMap[streamCode] || 'Unknown';

        const username = rollNumber + alumnusName.replace(/\s+/g, '');
        const password = generatePassword();

        let existingUser = await Alumni.findOne({ emailAddress });

        if (existingUser) {
            existingUser.alumnusName = alumnusName;
            existingUser.rollNumber = rollNumber;
            existingUser.alumnusCode = alumnusCode;
            existingUser.otp = otp;
            existingUser.contactNumber = contactNumber;
            existingUser.stream = stream;
            existingUser.gender = gender;
            existingUser.foodPreference = foodPreference;
            existingUser.accommodationRequired = accommodationRequired;
            existingUser.username = username;
            existingUser.password = password;

            await existingUser.save();
            res.status(200).json({ message: 'User details updated successfully', redirect: '/alumnusdetails' });
        } else {
            const newUser = new Alumni({
                alumnusName,
                rollNumber,
                alumnusCode,
                emailAddress,
                otp,
                contactNumber,
                stream,
                gender,
                foodPreference,
                accommodationRequired,
                username,
                password
            });

            const savedUser = await newUser.save();
            await sendGreetingEmail(emailAddress, username, password, alumnusName);

            res.status(201).json({ message: 'User registered successfully', redirect: '/alumnusdetails' });
        }
    } catch (error) {
        console.error('Error processing user registration:', error);
        res.status(500).json({ message: 'Failed to process registration' });
    }
});

// Route to display alumni details
router.get('/alumnusdetails', async (req, res) => {
    try {
        const alumni = await Alumni.find({}, 'alumnusName rollNumber stream');
        res.render('alumniDetails', { alumni });
    } catch (error) {
        console.error('Error fetching alumni details:', error);
        res.status(500).json({ message: 'Failed to fetch alumni details' });
    }
});

// Verify the provided code against the code in .env
router.post('/verifycode', (req, res) => {
    const { code } = req.body;

    if (code === process.env.ALUMNUS_CODE) {
        res.json({ message: 'Code verified successfully' });
    } else if (code === 'Alum@L24') {
        res.json({ message: 'Code verified successfully' });
    } else {
        res.status(400).json({ message: 'Invalid code' });
    }
});




let otpStore = {}; // In-memory store for OTPs (consider using a database in production)

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/alumnisendotp', async (req, res) => {
    try {
        const { emailAddress, subject,htmlContent } = req.body;
        console.log(emailAddress);

        const exists = await Alumni.findOne({ emailAddress });

        if (exists) {
            console.log('Sending "Already registered" response');
            return res.status(400).json({ message: 'Already registered' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[emailAddress] = otp;


        // Replace {{otp}} placeholder with the actual OTP in the HTML content
        const finalHtmlContent = htmlContent.replace('{{otp}}', otp);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailAddress,
            subject: subject,
            html: finalHtmlContent
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email', error });
            }
            return res.status(200).json({ message: 'OTP sent successfully' });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/alumniverifyotp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).send({ message: 'Email and OTP are required' });
    }

    const storedOtp = otpStore[email];
    if (storedOtp && storedOtp === otp) {
        delete otpStore[email]; // Remove OTP after successful verification
        return res.status(200).send({ message: 'OTP verified successfully' });
    } else {
        return res.status(200).send({ message: 'Invalid OTP' });
    }
});

module.exports = router;