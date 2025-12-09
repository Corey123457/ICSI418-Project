const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const User = require('./UserSchema');
const Pref = require('./Pref.js');
const Team = require('./Team'); // make sure this file exists
const Message = require('./Message'); // message schema (explained below)

// -----------------------
// EXPRESS + SOCKET SERVER
// -----------------------
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.json());
app.use(cors());

// -----------------------
// START SERVER
// -----------------------
server.listen(9000, () => {
    console.log('Server started at 9000');
});

// -----------------------
// MONGODB CONNECTION
// -----------------------
const mongoString = "mongodb+srv://Corey:zJcOMudWtLCt5dcs@cluster0.f8u7gla.mongodb.net/Lab";
mongoose.connect(mongoString);

const database = mongoose.connection;
database.on('error', (error) => console.log(error));
database.once('connected', () => console.log('Database Connected'));


// -----------------------
// SOCKET.IO CHAT LOGIC
// -----------------------
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
        console.log(`User joined group: ${groupId}`);
    });

    socket.on("sendMessage", async (msgData) => {
        // Save message to MongoDB
        const message = new Message(msgData);
        await message.save();

        // Broadcast to group members
        io.to(msgData.groupId).emit("receiveMessage", msgData);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


// -----------------------------------------
// EXISTING API ROUTES (you already had these)
// -----------------------------------------
app.post('/createUser', async (req, res) => {
    const un = req.body.username;

    try {
        User.exists({ username: un }).then((result) => {
            if (!result) {
                const user = new User(req.body);
                user.save();
                console.log(`User created! ${user}`);
                res.send(user);
            } else {
                res.status(500).send("Username already exists");
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
});


app.get('/getUser', async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.query.username,
            password: req.query.password
        });

        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.post('/createTeam', async (req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        res.send(team);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.post('/choosePref', async (req, res) => {
    try {
        const pref = new Pref(req.body);
        await pref.save();
        res.send(pref);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.get('/getTeams', async (req, res) => {
    try {
        const list = await Team.find({}, { team_name: 1 });
        res.send(list);
    } catch (error) {
        res.status(500).send(error);
    }
});
