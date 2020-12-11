const router = require('express').Router();
const { db } = require('../db/manageDB');
const md5 = require('md5');

router.get("/idor1", async (req, res) => {
    const id = req.query.id;
    if (id !== undefined) {
        db.get("SELECT * FROM user WHERE id=?",
            [id],
            (err, row) => {
                if (err) {
                    console.log("err sign-in:", err.message);
                    res.render("broken-acl/idor1", { user: undefined, err: err.message });
                } else {
                    res.render("broken-acl/idor1", { user: row, err: undefined });
                }
            })
    } else {
        res.render("broken-acl/idor1", { user: undefined, err: undefined });
    }
});

router.post("/idor1", async (req, res) => {
    const { username, password, information, mode } = req.body;
    if (mode === "register") {
        db.get("SELECT COUNT(id) AS numId FROM user", (err, row) => {
            if (err) {
                console.log("error count:", err.message);
                res.render("broken-acl/idor1", { user: undefined, err: err.message });
            }
            const id = Number(row["numId"]) + 1;
            db.run("INSERT INTO user(id, username, password, information) VALUES (?,?,?,?)",
                [id, username, md5(password), information],
                (err) => {
                    if (err) {
                        console.log("err insert:", err.message);
                        res.render("broken-acl/idor1", { user: undefined, err: err.message });
                    } else {
                        res.redirect("idor1?id=" + id);
                    }
                });
        });
    } else if (mode === "sign-in") {
        db.get("SELECT * FROM user WHERE username=? AND password=?",
            [username, md5(password)],
            (err, row) => {
                if (err || row === undefined) {
                    const message = err ? err.message : "user not exists";
                    console.log("err sign-in:", message);
                    res.render("broken-acl/idor1", { user: undefined, err: message });
                } else {
                    res.redirect("idor1?id=" + row["id"]);
                }
            })
    }
})

module.exports = router;