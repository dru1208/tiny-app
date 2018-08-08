var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


function generateRandomString() {
  return Math.random().toString(36).slice(2, 8)
};

function generateRandomString2() {
  var possible = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return possible[Math.floor(Math.random()*63)]
};

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", function (req, res) {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id/", (req, res) => {
  let templateVars = {shortURL: req.params.id,
                      longURL: urlDatabase[req.params.id],
                      username: req.cookies["username"]
                      };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});



app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.body.shortURL] = req.body.longURL
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.body.deleter];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  var newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body[Object.keys(req.body)[0]];
  res.redirect(`/urls/${newShortURL}`)
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
});

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});

