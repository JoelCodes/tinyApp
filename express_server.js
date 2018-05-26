const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
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
  res.locals = {
    userDB: users,
    urlDB: urlDatabase
  }

  res.locals.user = users[req.cookies.user_id];
  next();
})


var urlDatabase = {  
  "b2xVn2": {
    long: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    long: "http://www.google.com",
    userID: "user2RandomID"
  }
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
  for (var k in users) {                           
    if (users[k].email === username && users[k].password === password) {
      return users[k];
    }
  }
}

function checkEmail(email) {
  for (var k in users){                              
    if (users[k].email === email) {
      console.log(users[k])
      return true;
    }
  }
}

app.get("/", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

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
  // let user = req.cookies.user_id ? users[req.cookies.user_id] : false;
  let user; 
  let urls = {};
  if (req.cookies.user_id) {
    user = users[req.cookies.user_id];
    for(let url in urlDatabase) {
      if (urlDatabase[url].userID === user.id) {
        urls[url] = urlDatabase[url];
      }
    }
  } else {
    // user = false;
    // urls = false;
    res.send("401 Please register or login");
  }

  let templateVars = { urls: urls, user: user};
  // let urls = urlDatabase; ejs is doing this line behind the scene so you can use urls in the templates
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {    
    res.render("urls_new");
  } else {
    res.redirect("/login");
  } 
});


//param thats in header, specific id;key
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    short: req.params.shortURL,
    long: urlDatabase[req.params.shortURL].long
  };
  res.render("urls_show", templateVars);

  // if user is logged in and owns the URL for the given ID:        *******
  // returns HTML with:
  // the site header (see Display Requirements above)
  // the short URL (for the given ID)
  // a form which contains:
  // the corresponding long URL
  // an update button which makes a POST request to /urls/:id

  // if a URL for the given ID does not exist:
  // (Minor) returns HTML with a relevant error message
  // if user is not logged in:
  // returns HTML with a relevant error message
  // if user is logged it but does not own the URL with the given ID:
  // returns HTML with a relevant error message
});

app.post("/urls", (req, res) => {
  if (req.cookies.user_id) {
    const userId = req.cookies.user_id;
    const longURL = req.body["longURL"];  
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {
      long: longURL,
      userID: userId
    }
    res.redirect("/urls/"); 
  } else {
    res.send("403");
  }
});


app.get("/u/:shortURL", (req, res) => { 
  let shortURL = req.params.shortURL;     
  let longURL = urlDatabase[shortURL].long;
  res.redirect(longURL);
});

app.post("/urls/:short/delete", (req, res) => {
  if (req.cookies.user_id) {
    let shortURL = req.params.short;      
    delete urlDatabase[shortURL]
    res.redirect("/urls");
  } else {
    res.send("401 Please login");
  }
  
//   if user is logged in and owns the URL for the given ID:
// updates the URL
// redirects to /urls
//  if user is not logged in:
// (Minor) returns HTML with a relevant error message
//  if user is logged it but does not own the URL for the given ID:
// (Minor) returns HTML with a relevant error message
});

app.post("/urls/:short/edit", (req, res) => {
  let shortURL = req.params.short;      
  urlDatabase[shortURL].long = req.body.longURL;
  res.redirect("/urls");
});;


app.get("/login", (req, res) => {
  if (!req.cookies.user_id) {
    res.render("urls_login");
  } else {
    res.redirect("urls");
  }
})

app.post("/login", (req, res) => {
  let user = checkUser(req.body.email, req.body.password);
  if (!checkEmail(req.body.email)) {
    res.send("403");
  } else if (!user) {
    res.send("403");
  } else { //key in cookie    user that is returned from function .id 
    res.cookie("user_id", user.id); 
    res.redirect("/urls");   
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.get('/register', (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_reg");
  }
});

app.post('/register', (req, res) => {
  if (req.body.email === "" || req.body.password === "") {             
    res.send("400 Please enter email and password");
  } else if (checkEmail(req.body.email)) {  
    res.send("400 Email already exists, please login");
  } else {
    const userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: req.body.password,
    };
    res.cookie('user_id', userRandomID);
    res.redirect("/urls");
  }
// encrypts the new user's password with bcrypt
// sets a cookie
// redirects to /urls
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});