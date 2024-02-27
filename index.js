var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var db = require('./database/exerciseData');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Add a new user
app.post("/api/users", (req, res) => {
  var username = req.body.username;
  console.log("this is the name: ", username);
  
  console.log("\nthe body is:", req.body)
  
    var id = Math.random().toString(36).substr(2, 24); // Generate random ID
    db.push({_id: id, username:username });
    res.json({ username: username, _id: id });
  
});

// all user
app.get('/api/users', (req, res) => {
  var users = db.map(user => ({ _id: user._id, username: user.username }));
  res.json(users);
});

// Add exercises for a specific user
app.post('/api/users/:_id/exercises', (req, res) => {
  var { _id } = req.params;
  var { description, duration, date } = req.body;
  

  var entry = { description, duration: parseInt(duration), date: new Date(date).toDateString() };
  var user = db.find(user => user._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.log = user.log || [];
  user.log.push(entry);

  res.json({ _id, username: user.username, ...entry });
  console.log({ _id, username: user.username,...entry  });
});

// Retrieve exercise logs for a specific user
app.get('/api/users/:_id/logs', (req, res) => {
  var { _id } = req.params;
  var user = db.find(user => user._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  var { from, to, limit } = req.query;
  let logs = user.log || [];

  if (from) {
    logs = logs.filter(log => new Date(log.date) >= new Date(from));
  }
  if (to) {
    logs = logs.filter(log => new Date(log.date) <= new Date(to));
  }

  if (limit) {
    limit = parseInt(limit);
    logs = logs.slice(0, limit);
  }

  logs = logs.map(log => ({ ...log, date: new Date(log.date).toDateString() }));

  res.json({ _id, username: user.username, count: logs.length, log: logs });
  console.log({ _id, username: user.username, count: logs.length, log: logs })
});


var PORT = process.env.PORT || 3000;
var listener = app.listen(PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
