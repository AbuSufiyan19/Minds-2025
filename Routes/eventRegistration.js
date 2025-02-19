const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/UserRegister');
const eventSchema = require('../models/eventSoloSchema');
const EventTeamSchema = require('../models/eventTeamSchema');
const nodemailer = require('nodemailer');
const deleteLog = require('../models/DeleteEventSchema');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/sessioncheck', async (req, res) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId).lean();
        if (user) {
            res.json({ message: 'Session is active' });
        } else {
            res.status(401).json({ message: 'Unauthorized access. Please log in.' });
        }
    } else {
        res.status(401).json({ message: 'Unauthorized access. Please log in.' });
    }
});

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

async function generateUniqueTeamId(event) {
    const eventPrefixes = {
        'AlgoCode': 'AC',
        'CodeSprint': 'CS',
        'CrickBidAuction': 'CB',
        'Datathon': 'DN',
        'LastStandRacing': 'LR',
        'LastStandValorant': 'LV',
        'MathPirates': 'MP',
        'NetHunt': 'NT',
        'PicturePerfect': 'PP',
        'Techiadz': 'TZ',
        'Thinklytics': 'TL',
        'TripleTrouble': 'TT',
        'WittyMindz': 'WM',
    };

    const eventPrefix = eventPrefixes[event];
    if (!eventPrefix) {
        throw new Error(`Unknown event: ${event}`);
    }

    let teamId;
    let isUnique = false;

    while (!isUnique) {
        const randomString = generateRandomString(5);
        teamId = `${eventPrefix}${randomString}`;
        const sanitizedEventName = event.replace(/[^a-zA-Z0-9_]/g, '');

        const EventTeamModel = mongoose.model(sanitizedEventName, EventTeamSchema, sanitizedEventName);

        // Check if the teamId already exists in the database
        const existingEvent = await EventTeamModel.findOne({ teamId });

        if (!existingEvent) {
            isUnique = true;
        }
    }

    return teamId;
}

// Function to get or create the model
function getEventTeamModel(eventName) {
    const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9_]/g, '');

    if (mongoose.models[sanitizedEventName]) {
        return mongoose.model(sanitizedEventName);
    } else {
        return mongoose.model(sanitizedEventName, EventTeamSchema, sanitizedEventName);
    }
}


router.post('/eventReg', async (req, res) => {
    const { event } = req.body;
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }
        // Generate a unique team ID
        const teamId = await generateUniqueTeamId(event);

        // Sanitize the event name
        const sanitizedEventName = event.replace(/[^a-zA-Z0-9_]/g, '');

        // Access or create a dynamic collection based on the event name
        const EventTeamModel = getEventTeamModel(sanitizedEventName);

        // Find the user from the session
        const user = await User.findById(req.session.userId).lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is already registered
        const existingUser = await EventTeamModel.findOne({ emails: user.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already registered for this event' });
        }

        // Create new event record for the user
        const newEventRecord = new EventTeamModel({
            teamId: teamId,
            studentName: [user.studentName],
            emails: [user.email]
        });

        // Save the new event record
        await newEventRecord.save();

        // Update user's eventids
        await User.findByIdAndUpdate(req.session.userId, {
            $push: { eventids: teamId }
        });

        // const existsDeleteLog = await deleteLog.findOne({
        //     email: user.email,
        //     EventName: sanitizedEventName
        // });
        // if (existsDeleteLog) {
        //     const delted = await deleteLog.updateOne(
        //         { email: user.email },
        //         { $pull: { EventName: sanitizedEventName } }
        //     );
        //     const updatedDeleteLog = await deleteLog.findOne({ email: user.email })
        //     if (updatedDeleteLog.EventName.length === 0) {
        //         await deleteLog.findOneAndDelete({ email: user.email });
        //     }
        // }
        const teamSize = eventTeamSize[sanitizedEventName]
        const eDate = eventDate[sanitizedEventName]
        const minSize = eventMinTeamSize[sanitizedEventName]
        const imgUrl = eventUrl[sanitizedEventName]
        var HTMLContent, subContent;
        if (teamSize > 1) {

            subContent = `Login-2024 Team Registration successful for ${sanitizedEventName} - Login 2024`
            HTMLContent = `
                <p>Dear ${user.studentName},</p>
                <p>Congratulations! You’ve successfully created a team and registered for the event ${sanitizedEventName} at Login - 2024.</p>
                <p>Please share your team code <strong>${teamId}</strong> with your teammates so they can join your team and complete their registration.</p>
                <p>Also note that the minimum number of members required for your team to participate in this event is <strong>${minSize}</strong>. Ensure your team meets this requirement before the event.</p>
                <p>Do ensure that all team members are available to participate during the event. We look forward to your participation and wish you the best of luck!</p>
                <p>Event Date: <strong>${eDate}</strong> </p>
                <p>Don't forget to explore and participate in other exciting events at <a href="https://psglogin.in/#events-section">Login - 2024</a> to make the most of your experience!</p>
                <p>If you’ve any questions or need further assistance, feel free to contact us at <a href="mailto:${process.env.EMAIL_CONTACT}" style="color:blue; font-weight:bold;">${process.env.EMAIL_CONTACT}</a>.</p>
                <img src=${imgUrl} alt="Event poster" style="width: 300px;"><br>
                <p><strong>Best regards,</strong><br>
                Registration Team<br>
                Login-2024</p>
                <hr>
                <div style="width: 100%; text-align: center;">
                    <a href="https://psgtech.in"><img src="https://i.imgur.com/JQIgh6Y.png" alt="Login - 2024" style="width: 200px;"></a>
                    <p><strong>Hey, do you follow us on social media?</strong></p>
                    <a href="https://www.instagram.com/loginpsgtech/"><img src="https://cdn-icons-png.flaticon.com/128/174/174855.png" alt="Instagram" style="width: 40px;"></a>
                    &nbsp;&nbsp;
                    <a href="https://www.linkedin.com/company/login-psg-tech/"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="Linked In" style="width: 40px;"></a>
                    <p>Follow us to get the latest updates on events, announcements, and more.</p>
                </div>
                <hr>
                `
        } else {
            subContent = `Login-2024 Event Registration Confirmation for ${sanitizedEventName} - Login 2024`
            HTMLContent = `
                <p>Dear ${user.studentName},</p>
                <p>Congratulations! You’ve successfully registered for the event <strong>${sanitizedEventName}</strong> at <strong>Login - 2024</strong>.<br>
                <p>Please be available to participate during the event. We look forward to your participation and wish you the best of luck!</p>
                <p>Event Date: <strong>${eDate}</strong> </p>
                <p>Don't forget to explore and participate in other exciting events at <a href="https://psglogin.in/#events-section">Login - 2024</a> to make the most of your experience!</p>
                <p>If you’ve any questions or need further assistance, feel free to contact us at <a href="mailto:${process.env.EMAIL_CONTACT}" style="color:blue; font-weight:bold;">${process.env.EMAIL_CONTACT}</a>.</p>
                <img src=${imgUrl} alt="Event poster" style="width: 300px;"><br>
                <p><strong>Best regards,</strong><br>
                Registration Team<br>
                Login-2024
                </p>
                <hr>
                <div style="width: 100%; text-align: center;">
                    <a href="https://psgtech.in"><img src="https://i.imgur.com/JQIgh6Y.png" alt="Login - 2024" style="width: 200px;"></a>
                    <p><strong>Hey, do you follow us on social media?</strong></p>
                    <a href="https://www.instagram.com/loginpsgtech/"><img src="https://cdn-icons-png.flaticon.com/128/174/174855.png" alt="Instagram" style="width: 40px;"></a>
                    &nbsp;&nbsp;
                    <a href="https://www.linkedin.com/company/login-psg-tech/"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="Linked In" style="width: 40px;"></a>
                    <p>Follow us to get the latest updates on events, announcements, and more.</p>
                </div>
                <hr>
                `
        }
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: subContent,
            html: HTMLContent
        };

        transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Event registration successful', teamId: teamId });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//To Join team
// router.get('/myevent',(req,res) => {
//     res.render('myevents')
// })
const eventDate = {
    'AlgoCode': 'September 21 & 22',
    'CodeSprint': 'Online: September 18 & 19 and Offline: September 22',
    'CrickBidAuction': 'Online: September 19 and Offline: September 21',
    'Datathon': 'September 21 & 22',
    'LastStand': 'September 21st and 22nd',
    'MathPirates': 'September 21st and 22nd',
    'NetHunt': 'Online: September 16 - 20 and Offline: September 22',
    'PicturePerfect': 'Online: September 14 - 17 and Offline: September 21st and 22nd',
    'Techiadz': 'September 21st and 22nd',
    'Thinklytics': 'September 21st and 22nd',
    'TripleTrouble': 'September 21st and 22nd',
    'WittyMindz': 'September 21st and 22nd',
}
const eventUrl = {
    'AlgoCode': 'https://i.imgur.com/IYretuc.jpeg',
    'CodeSprint': 'https://i.imgur.com/L4sZydj.jpeg',
    'CrickBidAuction': 'https://i.imgur.com/H5BGfkV.jpeg',
    'Datathon': 'https://i.imgur.com/9b6zluD.jpeg',
    'LastStand': 'https://i.imgur.com/3nsQNpb.jpeg',
    'MathPirates': 'https://i.imgur.com/hzxXARm.jpeg',
    'NetHunt': 'https://i.imgur.com/Of4rmk5.jpeg',
    'PicturePerfect': 'https://i.imgur.com/3tXMfx6.jpeg',
    'Techiadz': 'https://i.imgur.com/bE5a0Nv.jpeg',
    'Thinklytics': 'https://i.imgur.com/hkGp4oA.png',
    'TripleTrouble': 'https://i.imgur.com/3dsJlsD.png',
    'WittyMindz': 'https://i.imgur.com/Ofy1Jnp.jpeg',
}
const coordinaterNo = {
    'AlgoCode': '7603993673',
    'CodeSprint': '9487903933',
    'CrickBidAuction': '9487903933',
    'Datathon': '8870557306',
    'LastStand': '9849630498',
    'MathPirates': '8610474908',
    'NetHunt': '9789424077',
    'PicturePerfect': '6374935130',
    'Techiadz': '8870834420',
    'Thinklytics': '7339003898',
    'TripleTrouble': '9384133686',
    'WittyMindz': '7397268063',
}
const eventPrefixes = {
    'AC': 'AlgoCode',
    'CS': 'CodeSprint',
    'CB': 'CrickBidAuction',
    'DN': 'Datathon',
    'LR':'LastStandRacing',
    'LV':'LastStandValorant',
    'MP': 'MathPirates',
    'NT': 'NetHunt',
    'PP': 'PicturePerfect',
    'TZ': 'Techiadz',
    'TL': 'Thinklytics',
    'TT': 'TripleTrouble',
    'WM': 'WittyMindz',
};

const eventTeamSize = {
    'AlgoCode': 2,
    'CodeSprint': 1,
    'CrickBidAuction': 3,
    'Datathon': 3,
    'MathPirates': 2,
    'LastStandRacing' : 1,
    'LastStandValorant':5,
    'NetHunt': 1,
    'PicturePerfect': 1,
    'Techiadz': 3,
    'Thinklytics': 2,
    'TripleTrouble': 3,
    'WittyMindz': 2,
};
const eventMinTeamSize = {
    'AlgoCode': 2,
    'CrickBidAuction': 3,
    'CodeSprint': 1,
    'Datathon': 2,
    'LastStand': 1,
    'MathPirates': 2,
    'LastStandRacing' : 1,
    'LastStandValorant': 1,
    'NetHunt': 1,
    'PicturePerfect': 1,
    'Techiadz': 2,
    'Thinklytics': 1,
    'TripleTrouble': 2,
    'WittyMindz': 2,
};
router.get('/myevent', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const eventIds = user.eventids;
        const eventDetailsPromises = [];

        for (let eventId of eventIds) {
            const prefix = eventId.slice(0, 2);
            const eventName = eventPrefixes[prefix];
            if (eventName) {
                // Sanitize the collection name
                const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9_]/g, '');

                // Access the existing collection
                const EventTeamModel = mongoose.model(sanitizedEventName, EventTeamSchema, sanitizedEventName);

                // Push the promise for fetching event details
                eventDetailsPromises.push(
                    EventTeamModel.findOne({ teamId: eventId }).then(eventDetail => {
                        if (eventDetail) {
                            // Add an email count check
                            const emailCount = eventDetail.emails.length;
                            const minSize = eventMinTeamSize[eventName];
                            const maxCount = eventTeamSize[eventName];
                            const isGreen = emailCount >= minSize;
                            var minCount = 0;
                            Count = emailCount;
                            // minCount = minSize - emailCount;

                            return {
                                eventDetail,
                                schemaName: sanitizedEventName, prefix, isGreen, Count, maxCount
                            };
                        } else {
                            return null;
                        }
                    })
                );
            } else {
                console.warn(`No event name found for prefix: ${prefix}`);
            }
        }

        // Wait for all promises to resolve
        const eventDetails = await Promise.all(eventDetailsPromises);

        // Filter out null values (in case any fetch returned null)
        const filteredEventDetails = eventDetails.filter(detail => detail !== null);

        res.render('myevents', { eventDetails: filteredEventDetails, user: user });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});


router.post('/joinevent', async (req, res) => {
    try {
        const { teamId } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not logged in' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const prefix = teamId.slice(0, 2);
        const eventName = eventPrefixes[prefix];

        if (!eventName) {
            return res.status(400).json({ success: false, message: 'Invalid team ID prefix' });
        }

        const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9_]/g, '');
        const EventTeamModel = mongoose.model(sanitizedEventName, EventTeamSchema, sanitizedEventName);

        const existingUser = await EventTeamModel.findOne({ emails: user.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already registered for this event' });
        }
        const eventDetail = await EventTeamModel.findOne({ teamId });

        if (!eventDetail) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        const maxTeamSize = eventTeamSize[eventName];
        if (eventDetail.emails.length >= maxTeamSize) {
            return res.status(400).json({ success: false, message: 'Team is full' });
        }

        if (!eventDetail.emails.includes(user.email)) {
            eventDetail.emails.push(user.email);
            eventDetail.studentName.push(user.studentName);
            await eventDetail.save();
        }
        await User.findByIdAndUpdate(req.session.userId, {
            $push: { eventids: teamId }
        });

        // const existsDeleteLog = await deleteLog.findOne({
        //     email: user.email,
        //     EventName: sanitizedEventName
        // });
        // if (existsDeleteLog) {
        //     await deleteLog.updateOne(
        //         { email: user.email },
        //         { $pull: { EventName: sanitizedEventName } }
        //     );
        //     const updatedDeleteLog = await deleteLog.findOne({ email: user.email })
        //     if (updatedDeleteLog.EventName.length === 0) {
        //         await deleteLog.findOneAndDelete({ email: user.email });
        //     }
        // }
        const minSize = eventMinTeamSize[sanitizedEventName]
        const imgUrl = eventUrl[sanitizedEventName];
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Successfully Joined Team for ${sanitizedEventName} - Login 2024`,
            html: `
            <p>Dear ${user.studentName},</p>
            <p>You’ve successfully joined your team for the event <strong>${sanitizedEventName}</strong> using the team code <strong>${teamId}</strong> at <strong>Login-2024</strong>.</p>
            <p>Thank you for being a part of this exciting event! Please coordinate with your team to prepare for the competition, and ensure everyone is ready for the big day.</p>
            <p>Also note that the minimum number of members required for your team to participate in this event is <strong>${minSize}</strong>. Ensure your team meets this requirement before the event.</p>
            <p>Please ensure that all team members participate in the event. We look forward to your active participation and wish you the best of luck!</p>
            <p>Event Date: <strong>${eDate}</strong></p>
            <p>Don't forget to explore and participate in other exciting events at <a href="https://psglogin.in/#events-section">Login - 2024</a> to make the most of your experience!</p>
            <p>If you’ve any queries or need further assistance, feel free to contact us at <a href="mailto:${process.env.EMAIL_CONTACT}" style="color:blue; font-weight:bold;">${process.env.EMAIL_CONTACT}</a>.</p>
            <img src=${imgUrl} alt="Event Poster" style="width: 300px;"><br>
            <p><strong>Best regards,</strong><br>
            Registration Team<br>
            Login-2024</p>  
            <hr>
            <div style="width: 100%; text-align: center;">
                <a href="https://psgtech.in"><img src="https://i.imgur.com/JQIgh6Y.png" alt="Login - 2024" style="width: 200px;"></a>
                <p><strong>Hey, do you follow us on social media?</strong></p>
                <a href="https://www.instagram.com/loginpsgtech/"><img src="https://cdn-icons-png.flaticon.com/128/174/174855.png" alt="Instagram" style="width: 40px;"></a>
                &nbsp;&nbsp;
                <a href="https://www.linkedin.com/company/login-psg-tech/"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="Linked In" style="width: 40px;"></a>
                <p>Follow us to get the latest updates on events, announcements, and more.</p>
            </div>
            <hr>
            `
        };
        transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Joined the team successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.delete('/delete/:schemaName/:teamId', async (req, res) => {
    const session = await deleteLog.startSession();
    session.startTransaction();
    try {
        const { schemaName, teamId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login');
        }

        // Find the user who initiated the delete request
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const email = user.email;
        const name = user.studentName;

        // Sanitize the schema name
        const sanitizedEventName = schemaName.replace(/[^a-zA-Z0-9_]/g, '');

        // Dynamically create the model for the event
        const EventTeamModel = mongoose.model(sanitizedEventName, EventTeamSchema, sanitizedEventName);

        // Find the event by teamId
        const event = await EventTeamModel.findOne({ teamId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Remove the specified email from the event's emails array
        await EventTeamModel.updateOne(
            { teamId },
            { $pull: { emails: email, studentName: name } }
        );

        // Find the user with the specified email
        const userWithEmail = await User.findOne({ email });
        if (userWithEmail) {
            // Remove the teamId from the user's eventids array
            await User.findByIdAndUpdate(
                userWithEmail._id,
                { $pull: { eventids: teamId } },
                { new: true }
            );
        }

        // Optionally, delete the document if no emails are left
        const updatedEvent = await EventTeamModel.findOne({ teamId });
        if (updatedEvent.emails.length === 0) {
            const deletedDoc = await EventTeamModel.findOneAndDelete({ teamId });
            if (!deletedDoc) {
                return res.status(404).json({ success: false, message: 'Team not found' });
            }
        }

        // // Try to find the existing document
        // const existsDeleteLog = await deleteLog.findOne({ email }).session(session);

        // if (existsDeleteLog) {
        //     // Update the document by pushing the new event name
        //     await deleteLog.updateOne(
        //         { email },
        //         { $push: { EventName: sanitizedEventName } },
        //         { session }
        //     );
        // } else {
        //     // If the document doesn't exist, create a new one
        //     const newLog = new deleteLog({
        //         EventName: [sanitizedEventName],
        //         studentName: name,
        //         email: email
        //     });
        //     await newLog.save({ session });
        // }

        // Commit the transaction
        // await session.commitTransaction();
        // session.endSession();
        // Send the cancellation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Cancellation of Registration for ${sanitizedEventName} - Login-2024`,
            html: `
            <p>Dear ${name},</p>
            <p>We’ve received your request to cancel your registration for the <strong>${sanitizedEventName}</strong> at the <strong>Login-2024</strong></p>
            <p>Your registration has been successfully cancelled. We’re sorry to hear that you won’t be able to join us this time. If there is anything we can do to assist you or if you have any further queries, please do not hesitate to contact us at <a href="mailto:${process.env.EMAIL_CONTACT}" style="color:blue;">${process.env.EMAIL_CONTACT}</a>.</p><br>
            <p>We hope to see you in future events.</p>
            <p><strong>Best regards,</strong><br>
            Registration Team<br>
            Login-2024</p>
            <hr>
            <div style="width: 100%; text-align: center;">
                <a href="https://psgtech.in"><img src="https://i.imgur.com/JQIgh6Y.png" alt="Login - 2024" style="width: 200px;"></a>
                <p><strong>Hey, do you follow us on social media?</strong></p>
                <a href="https://www.instagram.com/loginpsgtech/"><img src="https://cdn-icons-png.flaticon.com/128/174/174855.png" alt="Instagram" style="width: 40px;"></a>
                &nbsp;&nbsp;
                <a href="https://www.linkedin.com/company/login-psg-tech/"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="Linked In" style="width: 40px;"></a>
                <p>Follow us to get the latest updates on events, announcements, and more.</p>
            </div>
            <hr>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error:', error);

        // If any error occurs, abort the transaction
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        return res.status(500).json({ success: false, message: 'An error occurred while processing the request.' });
    }
});


router.get('/algocode', (req, res) => {
    const userId = req.session.userId;
    res.render('algocode', { user: userId });
});

router.get('/codesprint', (req, res) => {
    const userId = req.session.userId;
    res.render('codesprint', { user: userId });
});

router.get('/crickbidauctions', (req, res) => {
    const userId = req.session.userId;
    res.render('crickbidauction', { user: userId });
});

router.get('/datathon', (req, res) => {
    const userId = req.session.userId;
    res.render('datathon', { user: userId });
});

router.get('/laststand', (req, res) => {
    const userId = req.session.userId;
    res.render('laststand', { user: userId });
});

router.get('/mathpirates', (req, res) => {
    const userId = req.session.userId;
    res.render('mathpirates', { user: userId });
});

router.get('/nethunt', (req, res) => {
    const userId = req.session.userId;
    res.render('nethunt', { user: userId });
});

router.get('/pictureperfect', (req, res) => {
    const userId = req.session.userId;
    res.render('pictureperfect', { user: userId });
});

router.get('/staroflogin', (req, res) => {
    const userId = req.session.userId;
    res.render('staroflogin', { user: userId });
});

router.get('/techiadz', (req, res) => {
    const userId = req.session.userId;
    res.render('techiadz', { user: userId });
});

router.get('/thinklytics', (req, res) => {
    const userId = req.session.userId;
    res.render('thinklytics', { user: userId });
});

router.get('/tripletrouble', (req, res) => {
    const userId = req.session.userId;
    res.render('tripletrouble', { user: userId });
});

router.get('/wittymindz', (req, res) => {
    const userId = req.session.userId;
    res.render('wittymindz', { user: userId });
});

module.exports = router;
