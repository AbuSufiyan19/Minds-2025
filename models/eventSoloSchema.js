const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    email: { type: String, required: true }
});

module.exports = eventSchema;
