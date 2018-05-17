var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

function generateRandomString() {
  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (var i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  console.log(randomString);
  return randomString;
}

const bodyParser = require("body-parser");  //middleware, by pasing into app.use
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {  //only here for testing purposes
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// app.get("/", (req, res) => {
//   res.end("Hello!");
// });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
 // let urls = urlDatabase; -- ejs is doing this line behind the scense for you so that you can use urls in teh templates
  res.render("urls_index", templateVars);
});
               //param thats in header, specific id;key
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  let templateVars = { short: req.params.shortURL, long: urlDatabase[req.params.shortURL] }
  res.render("urls_show", templateVars);
});

// console.log(req.header)
// { shortUrl: 'abc123' }

app.post("/urls", (req, res) => {     
  const longURL = req.body.longURL;  //key is longURL so whatever is being typed in
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = longURL;
  res.redirect('/urls/' + shortUrl);  // + the generateRandomString
});
// body = {
//   name = jenn
//   longURL = whatever is being typed in browser
//   shortURL = what the generate function is generating
// }

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  // let longURL = urlDatabase[shortUrl];
  res.redirect(longURL);
  console.log(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
