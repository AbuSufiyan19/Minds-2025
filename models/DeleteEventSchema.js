const mongoose = require('mongoose');

const DeleteEventSchema = new mongoose.Schema({
    EventName: { type: [String], required:true, unique: true },
    studentName:{type: String, required: true},
    email: { type: String, required: true }
});

const deleteLog = mongoose.model('DeleteLog', DeleteEventSchema);

module.exports =  deleteLog;