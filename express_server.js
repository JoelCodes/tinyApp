const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");  //middleware, by pasing into app.use
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


function generateRandomString() {
  var randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  console.log(randomString);
  return randomString;
}

app.use((req, res, next) => { //middleware used instead of varsTemplates
  // res.locals.date = new Date(); // This only exists within the request/response
                                // Each req/res gets its own Date

  res.locals = {
  userDB: users,
  urlDB: urlDatabase
   }

  res.locals.user = users[req.cookies.user_id];
  next();
})

// app.locals.date = new Date(); // Locals across entire application and all requests
                                 // One request could change that for another request

var urlDatabase = {  //only here for testing purposes
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  }
};

function checkUser(username, password) {
  // let password = req.body.password
  // let username = req.body.email
  for (var k in users) {                           
    if (users[k].email === username && users[k].password === password) {
      return users[k];
    }
  }
  return false;
}

// let username = req.body.email
function checkEmail(email) {
  for (var k in users){                              
    if (users[k].email === email) {
      console.log(users[k])
      return true;
    }
  }
  return false;
}


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/cookies", (req, res) => {
  res.json(req.cookies);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  // let urls = urlDatabase; -- ejs is doing this line behind the scense for you so that you can use urls in teh templates
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  let shortURL = req.params.short;      
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase[shortURL], req.body);******
  res.redirect("/urls");
});


app.get("/login", (req, res) => {
  res.render('urls_login');
})

app.post("/login", (req, res) => {
  let user = checkUser(req.body.email, req.body.password);
  
  if (!checkEmail(req.body.email)) {
    res.send("403");
  } else if (!user) {
    res.send("403");
  } else {
    res.cookie("user_id", user.id); //res not req cause its sending the cookie back
    res.redirect("/urls");    //'username' the 'name' in application in chrome dev tools
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
// app.get('/test_view', (req, res) => { 
  // let templateVars = {
  //   username: req.cookies["username"],
  //   // date: new Date() // Provided by a middleware up above!!
  // }; 
  // res.render("test_view", templateVars);
//   res.render("test_view");
// })

app.get('/register', (req, res) => {
  res.render("urls_reg"); 
});

app.post('/register', (req, res) => {
  if (req.body.email === "" || req.body.password === "") {             
    res.send("400 Please enter email and password");
  } else if (checkEmail(req.body.email)) {
    // res.send("User already exists, please login");
    res.redirect("/login");
  } else {
    const userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: req.body.password,
    };
    res.cookie('user_id', userRandomID);   //res not req cause its sending the cookie back
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
