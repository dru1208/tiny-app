"use strict";
// requirements
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

app.use(
  cookieSession({
    name: "session",
    signed: false,
    maxAge: 24 * 60 * 60 * 1000
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// hard coded users and URL database to help with testing

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  dru: {
    id: "dru",
    email: "andrew.andrewhsieh@gmail.com",
    password: "topkek"
  },
  "developer chris": {
    id: "developer chris",
    email: "iamverysmart@gmail.com",
    password: "popeyes"
  },
  veely: {
    id: "veely",
    email: "vincentnocarbs@gmail.com",
    password: "keto4lyfe"
  }
};

var urlDatabase = {
  b2xVn2: {
    url: "http://www.lighthouselabs.ca",
    userId: "dru"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userId: "veely"
  }
};

// helper functions used in GET and POST down below

function searchDb(link) {
  for (var shortURL in urlDatabase) {
    if (shortURL === link) {
      return true;
    }
  }
  return false;
}

function filteredDbFunc(id) {
  let filteredDb = {};
  for (var entry in urlDatabase) {
    if (urlDatabase[entry].userId === id) {
      filteredDb[entry] = urlDatabase[entry];
    }
  }
  return filteredDb;
}

function compareEmailToUsers(inputEmail) {
  for (let user in users) {
    if (users[user].email === inputEmail) {
      return true;
    }
  }
  return false;
}

function comparePasswordToUsers(inputPassword) {
  for (let user in users) {
    if (bcrypt.compareSync(inputPassword, users[user].password)) {
      return true;
    }
  }
  return false;
}

function generateRandomString() {
  var possible =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var answer = "";
  for (var count = 0; count < 6; count++) {
    answer += possible[Math.floor(Math.random() * 62)];
  }
  return answer;
}

function findID(email) {
  var userId;
  for (var user in users) {
    if (users[user].email === email) {
      userId = users[user].id;
    }
  }
  return userId;
}

//---------------------------------------------------app.get----------------------------------------------------------------//


//redirects to login or urls based on login, can look to add a more attractive landing page

app.get("/", function(req, res) {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

//page of accumulated urls

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.end("You should log in or register first");
  } else {
    let filteredDb = filteredDbFunc(req.session.user_id);
    for (var entry in urlDatabase) {
      if (urlDatabase[entry].userId === req.session.user_id) {
        filteredDb[entry] = urlDatabase[entry];
      }
    }
    let userId = req.session.user_id;
    let templateVars = {
      userId: userId,
      Db: filteredDb,
      user: users[userId]
    };
    res.render("urls_index", templateVars);
  }
});

//form for adding a url to database

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let userId = req.session.user_id;
    let templateVars = {
      user: users[userId]
    };
    res.render("urls_new", templateVars);
  } else {
    let templateVars = {
      user: req.session.user_id
    };
    res.render("urls_login", templateVars);
  }
});

// link to long URL

app.get("/u/:shortURL", (req, res) => {
  if (searchDb(req.params.shortURL)) {
    let longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  } else {
    res.end("The URL for the given ID does not exist.");
  }
});

//completion page of adding url (displays short and long url)

app.get("/urls/:id/", (req, res) => {
  if (!req.session.user_id) {
    res.end("You should log in or register first");
  } else if (urlDatabase[req.params.id].userId !== req.session.user_id) {
    res.end("This URL link is not in your account!");
  } else {
    let userId = req.session.user_id;
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url,
      user: users[userId]
    };
    res.render("urls_show", templateVars);
  }
});

// original test for project
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

// registration page

app.get("/register", (req, res) => {
  let filteredDb = filteredDbFunc(req.session.user_id);
  let templateVars = {
    user: req.session.user_id,
    Db: filteredDb
  };
  if (!req.session.user_id) {
    res.render("urls_register", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

// login page

app.get("/login", (req, res) => {
  let filteredDb = filteredDbFunc(req.session.user_id);
  let templateVars = {
    user: req.session.user_id,
    Db: filteredDb
  };
  if (!req.session.user_id) {
    res.render("urls_login", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});




//---------------------------------------------------app.post---------------------------------------------------------------//

// post to add URLs

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userId) {
    urlDatabase[req.body.shortURL].url = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

// post to delete URLs

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.body.deleter];
  res.redirect("/urls");
});

//generates a random short url when a long URL is inputted

app.post("/urls", (req, res) => {
  var newShortURL = generateRandomString(); //6 random alphanumeric values
  urlDatabase[newShortURL] = {
    url: req.body[Object.keys(req.body)[0]],
    userId: req.session.user_id
  };
  res.redirect(`/urls/${newShortURL}`);
});

// generates login cookie

app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  if (compareEmailToUsers(email) && comparePasswordToUsers(password)) {
    req.session.user_id = findID(email);
    res.redirect("/urls");
  } else if (
    comparePasswordToUsers(req.body.password) ||
    compareEmailToUsers(req.body.email)
  ) {
    res.sendStatus(400);
  } else {
    res.sendStatus(404);
  }
});

//logs out and clears the cookie that saves login info

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//registration information is sent here from urls_register

app.post("/register", (req, res) => {
  if (compareEmailToUsers(req.body.email)) {
    res.sendStatus(400);
  } else if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(404);
  } else {
    var newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newId;
    res.redirect("/urls");
  }
});

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});
