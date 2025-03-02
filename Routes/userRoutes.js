const express = require('express');
const User = require('../models/UserRegister');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const router = express.Router();


// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware to check if user is authenticated
async function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).lean();
            if (user) {
                res.locals.user = user;
                return next();
            }
        } catch (error) {
            console.error('Error finding user:', error);
        }
    }
    res.locals.user = null;
    next();
}

// Routes
router.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: res.locals.user });
});

router.get('/register',  (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/resetpassword', (req, res) => {
    res.render('resetpassword');
});

router.post('/checkuser', async (req, res) => {
    const { email, contactNumber } = req.body;
    try {
        const user = await User.findOne({ email, contactNumber });
        if (user) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/rspassword', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
         // Hash the password
         const saltRounds = 8;
         const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await User.updateOne({ email }, { password: hashedPassword });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
        }

        // Hash the password
        const saltRounds = 8;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const clgname = req.body.collegeName;
            let otherclgname = ""; // Use let to allow reassignment

            // Check if the selected college is 'Others'
            if (clgname === 'Others') {
                otherclgname = req.body.otherCollegeName; // Assign the other college name
            } else {
                otherclgname = clgname; // Assign the original college name
            }

        // Create a new user instance
        const newUser = new User({
            studentName: req.body.studentName,
            rollNumber: req.body.rollNumber,
            collegeName: otherclgname,
            othercollegeName: req.body.otherCollegeName,
            collegeCode: req.body.collegeCode,
            degree: req.body.degree,
            stream: req.body.stream,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            password: hashedPassword,
            yearOfStudy: req.body.yearOfStudy,
            gender: req.body.gender,
            foodPreference: req.body.foodPreference,
            accommodation: req.body.accommodation,
        });

        // Save the user document
        const savedUser = await newUser.save();
        // const mailOptions = {
        //     from: process.env.EMAIL_USER,
        //     to: email,
        //     subject: 'Welcome to Minds-2025 - Successfully Registered',
        //     html: `
        //     <p>Dear ${req.body.studentName},</p>
        //     <p>Thank you for registering for <strong>Minds - 2025</strong>. Your account has been successfully created.</p>
        //     <p><strong>Minds - 2025</strong> takes place on <strong>February 27, 28 & March 1, 2025</strong>.Please check and register for the events you're interested in.</p>

        //     <h3>Next Steps:</h3>
        //     <ol>
        //         <li><strong>Explore Events:</strong> Learn more about each event, including their descriptions, participation details.</li>
        //         <li><strong>Register for Events:</strong>
        //             <ul>
        //                 <li><strong>Individual Events:</strong> Select the events you'd like to participate in and complete the registration process.</li>
        //                 <li><strong>Team Events:</strong> Set up your team by either creating a new team and sharing the team code with your members, or joining an existing team using a team code.</li>
        //             </ul>
        //         </li>
        //     </ol>

        //     <p>You will receive a confirmation email for each successful registration.</p>
        //     <p>We are thrilled to have you as a part of our symposium community and look forward to your active participation. If you have any queries or need assistance, please don't hesitate to reach out to us at <a href="mailto:${process.env.EMAIL_CONTACT}" style="color:rgb(0, 115, 255);">${process.env.EMAIL_CONTACT}</a>.</p>
            
        //     <br>
        //     <p><strong>Best regards,</strong><br>
        //         Registration Team <br>
        //         Minds - 2025</p>
        //     `
            
        // };
        // transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User registered successfully'  , user: savedUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find the user by email (case-insensitive)
        const user = await User.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Set the session userId
        req.session.userId = user._id;

        // Set cache-control headers to prevent caching sensitive pages
        res.set('Cache-Control', 'no-store');

        // Respond with a success message and optional redirect
        res.json({ message: 'Login successful', redirect: '/' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to log in' });
    }
});
// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to log out' });
        }
        res.set('Cache-Control', 'no-store');
        res.redirect('/');
    });
});


module.exports = router;
