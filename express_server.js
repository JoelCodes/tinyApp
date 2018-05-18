var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require("cookie-parser");

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

app.post("/urls", (req, res) => {     //view url
  const longURL = req.body.longURL;  //key is longURL so whatever is being typed in
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = longURL;
  res.redirect("/urls/");  // + the generateRandomString
});
// body = {
//   name = jenn
//   longURL = whatever is being typed in browser
//   shortURL = what the generate function is generating
// }

app.get("/u/:shortURL", (req, res) => {   //how woudl i get from current pg to
  let shortURL = req.params.shortURL;      //this one w/o manually changing it
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
  console.log(longURL);
});

app.post("/urls/:short/delete", (req, res) => {
  let shortURL = req.params.short;      
  // let longURL = urlDatabase[shortURL];
  delete urlDatabase[shortURL]
  res.redirect("/urls");
});

app.post("/urls/:short/edit", (req, res) => {
  // Update the database[req.params.short]
  let shortURL = req.params.short;      
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase[shortURL], req.body);
  res.redirect("/urls");
});

app.post("/urls/login", (req, res) => {
  name = req.login;
  value = req.params.login;
  res.cookie(name, value); //why res.cookie and not req.cookie
  // res.cookie(name, value);
  // if(username == )
  res.redirect("/urls");
});

app.use(cookieParser());
// req = {
//   params : {
//       shortURL : ____
//   }
// }
//info from body is the form; info from a param is in the URL

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
