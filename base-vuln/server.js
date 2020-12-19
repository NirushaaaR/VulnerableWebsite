const express = require('express');
const cookieParser = require('cookie-parser')
const { initNewDb, db } = require('./db/manageDB');

initNewDb();
// clear db and recreate it every 1 hour
setInterval(initNewDb, 1000 * 60 * 60);

// App
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');

app.use('/xss', require('./routes/xss-route'));
app.use('/sqli', require('./routes/sqli-route'));
app.use('/broken-acl', require('./routes/broken-acl-route'));
app.use('/broken-auth', require('./routes/broken-auth-route'));


// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}`));

