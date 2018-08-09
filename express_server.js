var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "dru": {
    id: "dru",
    email: "andrew.andrewhsieh@gmail.com",
    password: "topkek"
  },
  "developer chris": {
    id: "developer chris",
    email: "iamverysmart@gmail.com",
    password: "popeyes"
  },
  "veely": {
    id: "veely",
    email: "vincentnocarbs@gmail.com",
    password: "keto4lyfe"
  }
}

function compareEmailToUsers (inputEmail) {
  for (let user in users) {
    if (users[user].email === inputEmail) {
      return true
    }
  } return false
}

function comparePasswordToUsers (inputPassword) {
  for (let user in users) {
    if (users[user].password === inputPassword) {
      return true;
    }
  } return false
}

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8)
};

function generateRandomString2() {
  var possible = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return possible[Math.floor(Math.random()*63)]
};

function findID (email) {
  for (var user in users) {
    if (users[user].email === email) {
      var userId = users[user].id
    }
  } return userId
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", function (req, res) {
  res.end("Hello!");
});

//page of accumulated urls
app.get("/urls", (req, res) => {
  let userId = req.cookies["user_id"]
  let templateVars = {
    urls: urlDatabase,
    user: users[userId]};
  res.render("urls_index", templateVars);
});

//form for adding a url to database
app.get("/urls/new", (req, res) => {
  let userId = req.cookies["user_id"]
  let templateVars = {
    user: users[userId]
  }
  res.render("urls_new");
});

//fill this out
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//completion page of adding url (displays short and long url)
app.get("/urls/:id/", (req, res) => {
  let userId = req.cookies.user_id
  let templateVars = {shortURL: req.params.id,
                      longURL: urlDatabase[req.params.id],
                      user: users[userId]
                      };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: req.cookies.user_id
  }
  res.render("urls_register", templateVars);
})

app.get("/login", (req, res) => {
  let templateVars = {
    user: req.cookies.user_id
  }
  res.render("urls_login", templateVars)
})


app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.body.shortURL] = req.body.longURL
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.body.deleter];
  res.redirect("/urls");
});

//generates a random short url when a long URL is inputted
app.post("/urls", (req, res) => {
  var newShortURL = generateRandomString(); //6 random alphanumeric values
  urlDatabase[newShortURL] = req.body[Object.keys(req.body)[0]];
  res.redirect(`/urls/${newShortURL}`)
});

app.post("/login", (req, res) => {
  var email = req.body.email
  var password = req.body.password
  if (compareEmailToUsers(email) && comparePasswordToUsers(password)) {
    res.cookie("user_id", findID(email))
    res.redirect("/urls")
  } else if (comparePasswordToUsers(req.body.password) || compareEmailToUsers(req.body.email)) {
    res.sendStatus(400)
  } else {
    res.sendStatus(404)
  }
});

//logs out and clears the cookie that saves login info
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
});

//registration information is sent here from urls_register
app.post("/register", (req, res) => {
  if (compareEmailToUsers(req.body.email)) {
    res.sendStatus(400)
  } else if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(404)
  } else {
  var newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", newId);
  res.redirect("/urls");
  console.log(users);
  }
})

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});

