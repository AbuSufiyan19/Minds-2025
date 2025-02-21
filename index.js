const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit the process with an error code
});

// Middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Add this line to parse URL-encoded form data

app.use('/css', express.static(path.resolve(__dirname, "views/css")));
app.use('/js', express.static(path.resolve(__dirname, "views/js")));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});
const ALLOWED_PUBLIC_IP = process.env.ALLOWED_PUBLIC_IP || "14.139.180.67"; // Replace with your WiFi's public IP

// Middleware to restrict access based on Public IP
app.use((req, res, next) => {
    const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    console.log(`Client IP: ${clientIp}`);

    if (clientIp !== ALLOWED_PUBLIC_IP) {
        return res.status(403).json({ error: "Access Denied. Please connect to the allowed WiFi." });
    }

    next();
});

const userRoutes = require('./Routes/userRoutes');
const otproute = require('./Routes/verifyotp');
const eventregistrationRoutes = require('./Routes/eventRegistration')


app.use(userRoutes);
app.use(otproute);
app.use(eventregistrationRoutes);

// Start server
const PORT = process.env.PORT || 5000;  
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://localhost:${PORT}`);
});