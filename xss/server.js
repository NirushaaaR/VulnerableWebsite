const express = require('express');
const redis = require("redis");
const client = redis.createClient(`redis://${process.env.REDIS}:6379/`);
const puppeteer = require('puppeteer');

const xss = require('xss');

client.on("error", function (error) {
    console.error("REDIS ERROR", error);
});

// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.get('/xss1', (req, res) => {
    // console.log(req.query.code);
    const code = req.query.code;
    res.render('xss1', { code });
});

app.get('/xss1-improve', (req, res) => {
    // flag is FLAG{REMOVE_SCRIPT_IS_NOT_ENOUGHT}
    let code = req.query.code;
    var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    while (SCRIPT_REGEX.test(code)) {
        code = code.replace(SCRIPT_REGEX, "");
    }

    const test_code = xss(code);
    console.log(test_code, code);

    if (code && test_code !== code && code.indexOf("onerror=") === -1) {
        // attach a flag!!!
        code += "<script>alert('Here is Your Flag: FLAG{REMOVE_SCRIPT_IS_NOT_ENOUGHT}')</script>";
    }
    res.render('xss1-improve', { code });
});

app.get('/xss2', (req, res) => {

    const id = req.query.answerid;
    console.log('id', id);
    if (id) {

        client.HMGET(id, 'name', 'answer', function (err, values) {
            if (err) {
                console.log('err', err);
                return res.render('xss2', { 'name': undefined, 'answer': undefined });
            }
            console.log('values', values);
            return res.render('xss2', { 'name': values[0], 'answer': values[1] });
        });

    } else {
        return res.render('xss2', { 'name': undefined, 'answer': undefined });
    }

});

app.post('/xss2', (req, res) => {
    const randomId = Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    client.HMSET(randomId, "name", req.body.name, 'answer', req.body.answer, async function (err, reply) {
        if (err) {
            return res.send('ERROR CAN"T UPLOAD!!');
        } else {
            client.EXPIRE(randomId, 120);
            try {
                const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const page = await browser.newPage();
                await page.setCookie({name: 'FLAG', value: 'FLAG{HERE_HAVE_SOME_COOKIE}', domain: '127.0.0.1'});
                await page.goto(`http://127.0.0.1:8000/xss2?answerid=${randomId}`, {waitUntil: 'networkidle2'});
                await browser.close();
            } catch (error) {
                console.error("error", error);
            } finally {
                return res.redirect(`/xss2?answerid=${randomId}`);
            }
        }
    });
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
