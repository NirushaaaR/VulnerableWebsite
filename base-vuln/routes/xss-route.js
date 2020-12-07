const puppeteer = require('puppeteer');
const router = require('express').Router();
const db = require('../db/manageDB');

router.get('/xss1', (req, res) => {
    const code = req.query.code;
    res.render('xss1', { code });
});

router.get('/xss1-improve', async (req, res) => {
    // flag is FLAG{REMOVE_SCRIPT_IS_NOT_ENOUGHT}
    let code = req.query.code;
    var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

    while (SCRIPT_REGEX.test(code)) {
        code = code.replace(SCRIPT_REGEX, "");
    }

    if (code !== undefined) {
        while (SCRIPT_REGEX.test(code)) {
            code = code.replace(SCRIPT_REGEX, "");
        }
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        try {
            const page = await browser.newPage();
            page.on('dialog', async dialog => {
                code += "<script>alert('Here is Your Flag: FLAG{REMOVE_SCRIPT_IS_NOT_ENOUGHT}')</script>";
                await dialog.dismiss()
            });
            await page.goto(`http://127.0.0.1:8000/xss/xss1?code=${code}`);
            await page.close();
        } catch (error) {
            console.log("error:", error.message);
        } finally {
            await browser.close();
        }
    }
    return res.render('xss1-improve', { code });
});

router.get('/xss2', async (req, res) => {

    const id = req.query.answerid;
    console.log('id', id);
    if (id) {

        db.get("SELECT name, answer FROM quiz WHERE id=$id", {
            $id: id
        }, (error, row) => {

            if (error) {
                console.error(error);
                return res.render('xss2', { 'name': undefined, 'answer': undefined, 'error': true })
            } else if (row === undefined) {
                return res.send("the quiz id not exists").status(404);
            }

            return res.render('xss2', { 'name': row.name, 'answer': row.answer, 'error': false })
        });

    } else {
        return res.render('xss2', { 'name': undefined, 'answer': undefined });
    }

});

router.post('/xss2', async (req, res) => {
    const randomId = Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);

    db.run("INSERT INTO quiz(id, name, answer) VALUES(?, ?, ?)",
        [randomId, req.body.name, req.body.answer],
        async (err) => {
            if (err) {
                console.log(err);
                res.send('ERROR CAN"T UPLOAD!!');
            }
            // set clear db every .. hour
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            try {
                const page = await browser.newPage();
                await page.setCookie({ name: 'FLAG', value: 'FLAG{HERE_HAVE_SOME_COOKIE}', domain: '127.0.0.1' });
                console.log("before enter site")
                page.on('dialog', async dialog => {
                    // in case person use alert function
                    await dialog.dismiss()
                });
                await page.goto(`http://127.0.0.1:8000/xss/xss2?answerid=${randomId}`);
                console.log("after enter site")
            } catch (error) {
                console.error("error", error);
            } finally {
                await browser.close();
                return res.redirect(`xss2?answerid=${randomId}`);
            }
        });
});

module.exports = router;