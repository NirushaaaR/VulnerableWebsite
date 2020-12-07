const express = require('express');

// App
const app = express();
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use('/xss', require('./routes/xss-route'));


// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}`));

