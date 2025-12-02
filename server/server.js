const express = require('express');
const cors = require('cors');
const app = express();
const User = require('./UserSchema');
const Pref = require('./Pref.js')
const Location = require('./Location');

app.use(express.json());
app.use(cors())
app.listen(9000, ()=> {
    console.log('Server Started at ${9000}')
})

const mongoose = require('mongoose');
const mongoString = "mongodb+srv://Corey:zJcOMudWtLCt5dcs@cluster0.f8u7gla.mongodb.net/Lab"
mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => console.log(error))

database.once('connected', () => console.log('Databased Connected'))

app.post('/createUser', async (req, res) => {
    console.log(`SERVER: CREATE USER REQ BODY: ${req.body.username} ${req.body.firstName} ${req.body.lastName}`)
    const un = req.body.username
    try {
        //Check if username already exists in database
        User.exists({username: un}).then(result => {
            if(Object.is(result, null)) {
                const user = new User(req.body);
                user.save()
                console.log(`User created! ${user}`)
                res.send(user)
            }
            else {
                console.log("Username already exists")
                res.status(500).send("Username already exists")
            }
        })
    }
    catch (error){
        res.status(500).send(error)
    }
})

app.get('/getUser', async (req, res) => {
    const username = req.query.username
    const password = req.query.password

    console.log(username)
    console.log(password)
    try {
        const user = await User.findOne({ username, password })
        res.send(user)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

app.post('/createTeam', async (req, res) => {
    try {
            const team = new Team(req.body);
            team.save()
            console.log(`Team created! ${team}`)
            res.send(team)
    }
    catch (error){
        res.status(500).send(error)
    }
})

app.post('/choosePref', async (req, res) => {
    try {
            const pref = new Pref(req.body);
            pref.save()
            console.log(`Pref created! ${pref}`)
            res.send(pref)
    }
    catch (error){
        res.status(500).send(error)
    }
})

app.get('/getTeams', async (req, res) => {
    try {
        const teamList = await Team.find({}, {team_name:1});
        res.send(teamList)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

app.post('/saveLocation', async (req, res) => {
  try {
    const { id, name, address, description } = req.body;

    let doc;
    if (id) {
      // update existing
      doc = await Location.findByIdAndUpdate(
        id,
        { name, address, description },
        { new: true, upsert: true }
      );
    } else {
      // create new
      doc = new Location({ name, address, description });
      await doc.save();
    }

    res.send(doc);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.delete('/deleteLocation/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Location.findByIdAndDelete(id); // or findByIdAndRemove

    if (!deleted) {
      return res.status(404).send('Location not found');
    }

    res.send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

