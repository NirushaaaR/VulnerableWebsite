const router = require('express').Router();
const { sqliDB } = require('../db/manageDB');
const md5 = require('md5');

router.get("/sqli1", async (req, res) => {

    const person = req.query.person;

    if (person !== undefined) {
        const command = `SELECT person,want from gift where person="${person}"`;
        sqliDB.all(command, function (err, rows) {
            console.log(command, rows);
            if (err) {
                console.log(err.message);
            }
            return res.render("sqli/sqli1", { gifts: rows });
        });
    } else {
        return res.render("sqli/sqli1", { gifts: undefined });
    }

});

router.get("/login", async (req, res) => {
    res.render("sqli/login");
});

router.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password);

    const command = `SELECT * FROM user WHERE username="${username}" and password="${password}"`;
    sqliDB.get(command, function (err, row) {
        console.log("command", command);
        console.log("row", row);
        if (err || row === undefined) {
            console.log("err", err);
            return res.redirect("login");
        }

        return res.render("sqli/admin-panel", { user: row });
    })


});

router.get("/error-based", async (req, res) => {
    let command = 'SELECT * FROM artinmuse';
    if (req.query.search) {
        command += ` WHERE title="${req.query.search}" OR author="${req.query.search}"`
    }
    sqliDB.all(command, function (err, arts) {
        if (err) {
            const message = err.message + " query: "+ command + " FLAG{ERROR_FROM_SQL_COMMAND}";
            return res.render("sqli/error-based", { arts, err: message });
        }

        return res.render("sqli/error-based", { arts, err });
    });
});

router.get("/blind", async (req, res) => {
    sqliDB.get("PRAGMA full_column_names;", (err, row) => {
        if (err) {
            console.log("Error:", err);
        }
        console.log(row);
        return res.send("testing");
    })
});

module.exports = router;