const express = require('express');
const app = express();
const path = require('path');
const { initDb } = require('./db/setup');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ 
    // dest: __dirname + "/tmp/" 
});

const authMiddleware = require('./middleware/authCookie');

// route
const homeRoute = require('./controller/home');
const productRoute = require('./controller/product');
const authRoute = require('./controller/auth');
const userRoute = require('./controller/user');

// initdb and reset every 1 hour
initDb();
setInterval(() => {
    initDb();
}, 1000 * 60 * 60);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

app.get("/", homeRoute.home);
app.get("/about", homeRoute.about);
app.post("/complain", upload.single("complain"), homeRoute.complain);

app.get("/brand", productRoute.brand);
app.post("/buy-phone", authMiddleware.checkUesr, productRoute.buyPhone);

app.get("/login", authRoute.getLogin);
app.post("/login", authRoute.postLogin);
app.get("/register", authRoute.getRegister);
app.post("/register", authRoute.postRegister);
app.get("/logout", authRoute.logout);

app.get("/profile", authMiddleware.checkUesr, userRoute.profile);


app.get("/robots.txt", (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /");
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.render("error", { error: err.message });
});

const PORT = 11000;

app.listen(PORT, () => console.log("Server Start..."));