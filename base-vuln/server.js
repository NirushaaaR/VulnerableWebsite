const express = require('express');
const { initNewDb } = require('./db/manageDB');

initNewDb();
// clear db and recreate it every 1 hour
setInterval(initNewDb, 1000 * 60 * 60);

// App
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'ejs');

app.use('/xss', require('./routes/xss-route'));


// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}`));

