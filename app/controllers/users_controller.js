const bcrypt = require('bcrypt');
const ejs = require('ejs');

const User = require("../models/user.js");

let UsersController = {};

UsersController.showRegistrationPage = async (req, res) => {
  const html = await ejs.renderFile("./views/register.ejs", {});
  res.send(html);
};

UsersController.register = async (req, res) => {
  const username = req.body.username;
  const hashed = await bcrypt.hash(req.body.password, 10);
  let isOrganizer = false;

  try {
    const homonymousUser = await User.findOne({username: username});
    if (homonymousUser) {
      const html = await ejs.renderFile("./views/register.ejs",
        {message: "Username already used. Use another username."});
      return res.send(html);
    }

    const result = await User.find({});
    if (result.length === 0) {
      isOrganizer = true;
    }
  }
  catch(error) {
    console.log("ERRORE nel leggere da USER");
    console.log(error);
    return res.status(500).send("ERRORE nel leggere da USER");
  };

  const newUser = new User({
    "username": username,
    "passwordHash": hashed,
    "isOrganizer": isOrganizer
  });

  newUser.save()
  .then((result) => {
    console.log("NEW USER salvato correttamente nel DB.");
    req.session.username = username;
    req.session.isAuthenticated = true;
    req.session.isOrganizer = isOrganizer;
    
    // TODO: modificare la risposta
    // res.status(200).json({message: "NEW USER salvato correttamente nel DB.", data: newUser});
    req.session.flash = { type: "success", message: "Sign Up completed successfully" };
    res.redirect('/home');
  })
  .catch((error) => {
    console.log("ERRORE nel salvare NEW USER");
    console.log(error);
    res.status(500).send("ERRORE nel salvare NEW USER");
  });
};

UsersController.showLoginPage = async (req, res) => {
  const html = await ejs.renderFile("./views/login.ejs", {});
  res.send(html);
};

UsersController.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({username: username});

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      console.log("Login effettuato");
      req.session.username = username;
      req.session.isAuthenticated = true;
      req.session.isOrganizer = user.isOrganizer;
      
      // TODO: modificare la risposta
      //return res.send("Login effettuato con successo");
      req.session.flash = { type: "success", message: "Login completed successfully" };
      return res.redirect('/home');
    }

    const html = await ejs.renderFile("./views/login.ejs",
      {message: "Invalid credentials"});
    res.send(html);
  }
  catch(error) {
    console.log("ERRORE nel leggere da USER");
    console.log(error);
    return res.status(500).send("ERRORE nel leggere da USER");
  }
};

UsersController.logout = (req, res) => {
  req.session.destroy();

  /*req.session = {};
  req.session.flash = { type: "neutral", message: "Logged out" };*/
  res.redirect('/home');
};

module.exports = UsersController;