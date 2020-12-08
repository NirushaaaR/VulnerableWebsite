const router = require('express').Router();
const { db } = require('../db/manageDB');
const { browserEnterXSS2, browserEnterXSS1, browserTestXSS } = require('../functions/imitateBrowser');

router.get('/xss1', (req, res) => {
    const code = req.query.code;
    res.render('xss1', { code });
});

router.get('/xss1-improve', async (req, res) => {
    // flag is FLAG{REMOVE_SCRIPT_IS_NOT_ENOUGHT}
    let code = req.query.code;
    var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

    if (code !== undefined) {
        while (SCRIPT_REGEX.test(code)) {
            code = code.replace(SCRIPT_REGEX, "");
        }
        code = await browserEnterXSS1(code);
    }
    return res.render('xss1-improve', { code });
});

router.get('/xss2', async (req, res) => {

    const id = req.query.answerid;
    // console.log('id', id);
    if (id !== undefined) {
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
            browserEnterXSS2(randomId);
            return res.redirect(`xss2?answerid=${randomId}`);
        });
});

router.get("/xss-dom", async (req, res) => {
    res.render("xss-dom");
});

router.post("/test-xss", async (req, res) => {
    // TODO: think of flag name...
    const url = req.body.url;
    const result = await browserTestXSS(url);
    if (result) {
        return res.send({ "message": "FLAG{SOME_FLAG_HERE}" })
    }

    return res.send({ "message": "ไม่มี xss" })
})

router.get("/xss-mutation", async (req, res) => {
    const input = req.query.input;
    res.render("xss-mutation", { input: input });
});

module.exports = router;