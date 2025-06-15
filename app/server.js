const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');
//const ejs = require('ejs');

const initDB = require("./initDB.js");
//const User = require("./models/user.js");
//const Event = require("./models/event.js");
//const Signup = require("./models/signup.js");

// CONTROLLER
const UsersController = require("./controllers/users_controller.js");
const EventsController = require("./controllers/events_controller.js");
const SignupsController = require("./controllers/signups_controller.js");

const app = express();

// MIDDLEWARE

app.use(session({
  secret: 'chiave-segreta',
  resave: false,
  saveUninitialized: false
}));
// Imposta la cartella static per i file statici
app.use("/static", express.static(__dirname + "/static"));
// Imposta EJS come motore di template
app.set("view engine", "ejs");
// Imposta la cartella views per i file .ejs
app.set("views", __dirname + "/views");
// Per leggere i dati dei form (POST)
app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// CONNECTION TO DB
initDB().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});

// AUTHENTICATION MIDDLEWARE
const authStrict = (req, res, next) => {
  if (req.session.isAuthenticated) {
    res.locals.username = req.session.username;
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.isOrganizer = req.session.isOrganizer;
    return next();
  }
  res.status(401).render('error', { status: 401, message: "Access denied! You must be registered to access the requested resource." });
};

const authSoft = (req, res, next) => {
  if (req.session.isAuthenticated) {
    res.locals.username = req.session.username;
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.isOrganizer = req.session.isOrganizer;
  }
  next();
};

const authOrganizer = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.isOrganizer) {
    return next();
  }
  res.status(401).render('error', { status: 401, message: "Access denied! You must be an organizer to access the requested resource." });
}

// ENDPOINT
app.get('/register', UsersController.showRegistrationPage);

app.post('/register', UsersController.register);

app.get('/login', UsersController.showLoginPage);

app.post('/login', UsersController.login);

app.post('/logout', authStrict, UsersController.logout);


app.get('/home', authSoft, (req, res) => {
    res.render('home');
});

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/events/new', authOrganizer, EventsController.showCreateEventPage);

app.post('/events/new', authOrganizer, EventsController.createEvent);

app.get('/events/created', authOrganizer, EventsController.showCreatedEventsPage);

app.get('/events/subscribed', authStrict, SignupsController.showSubscribedEventsPage);

app.get('/events/:id', authSoft, EventsController.showEventDetailsPage);

app.post('/events/:id/subscribe', authStrict, SignupsController.subscribe);

app.post('/events/:id/unsubscribe', authStrict, SignupsController.unsubscribe);


// RESTful API
app.get('/api/events/past.json', EventsController.getPastEventsJSON);

app.get('/api/events/today.json', EventsController.getTodayEventsJSON);

app.get('/api/events/upcoming.json', EventsController.getUpcomingEventsJSON);

app.get('/api/events/:id/signups/count', SignupsController.getSignupsCount);

app.get('/api/events/subscribed/past.json', authStrict, SignupsController.getSubscribedPastEventsJSON);

app.get('/api/events/subscribed/today.json', authStrict, SignupsController.getSubscribedTodayEventsJSON);

app.get('/api/events/subscribed/upcoming.json', authStrict, SignupsController.getSubscribedUpcomingEventsJSON);


process.on("SIGINT", async () => {
  console.log("Ricevuto SIGINT, chiusura database...");
  try {
    await mongoose.connection.close();
    console.log("Connessione al database MongoDB chiusa.");
    process.exit(0);
  } catch (err) {
    console.error("Errore durante la chiusura del database: ", err);
    process.exit(1);
  }
});