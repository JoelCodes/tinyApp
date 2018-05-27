const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession ({
  name: "session",
  keys: ["tinyApp123"]
}))
app.use((req, res, next) => {
  res.locals = {
    userDB: users,
    urlDB: urlDatabase
  }
  res.locals.user = users[req.session.user_id];
  next();
});

const urlDatabase = {  
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


function generateRandomString() {
  var randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  return randomString;
}

function getUser(email) {
  for (var k in users) {                           
    if (users[k].email === email) {
      return users[k];
    }
  }
}

function checkEmail(email) {
  for (var k in users){                              
    if (users[k].email === email) {
      return true;
    }
  }
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


app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let user; 
  let urls = {};
  if (req.session.user_id) {
    user = users[req.session.user_id];
    for(let url in urlDatabase) {
      if (urlDatabase[url].userID === user.id) {
        urls[url] = urlDatabase[url];
      }
    }
  } else {
    res.send("401 Please register or login");
    return;
  }
  let templateVars = { urls: urls, user: user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {    
    res.render("urls_new");
  } else {
    res.redirect("/login");
  } 
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      short: req.params.shortURL,
      long: urlDatabase[req.params.shortURL].long
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("401 Please login");
  }
});

app.get("/u/:shortURL", (req, res) => { 
  let shortURL = req.params.shortURL;     
  let longURL = urlDatabase[shortURL].long;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
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

app.post("/urls/:short/edit", (req, res) => {
  if (req.session.user_id) {
    let shortURL = req.params.short;
    urlDatabase[shortURL].long = req.body.longURL;      
    res.redirect("/urls");
  } else {
    res.send("401 Please login");
  }
});

app.post("/urls/:short/delete", (req, res) => {
  if (req.session.user_id) {
    let shortURL = req.params.short;      
    delete urlDatabase[shortURL]
    res.redirect("/urls");
  } else {
    res.send("401 Please login");
  }
});


app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_login");
  } else {
    res.redirect("urls");
  }
})

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_reg");
  }
});

app.post("/login", (req, res) => {
  let user = getUser(req.body.email);
  if (!user) {
    res.send("403");
  } else if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id; 
    res.redirect("/urls");   
  } else {
    res.send("403");
  }
});

app.post('/register', (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (req.body.email === "" || req.body.password === "") {             
    res.send("401 Please enter email and password");
  } else if (checkEmail(req.body.email)) {  
    res.send("400 Email already exists, please login");
  } else {
    const userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: hashedPassword,
    };
    req.session.user_id = userRandomID;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});