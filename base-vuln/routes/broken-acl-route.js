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
    if (mode === "register" && username !== "admin") {
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
                        res.redirect("/broken-acl/idor1?id=" + id);
                    }
                });
        });
    } else if (mode === "sign-in") {
        db.get("SELECT * FROM user WHERE username=? AND password=?",
            [username, md5(password)],
            (err, row) => {
                if (err || row === undefined) {
                    const message = err ? err.message : "ไม่มี username นี้ในระบบ";
                    console.log("err sign-in:", message);
                    res.render("broken-acl/idor1", { user: undefined, err: message });
                } else {
                    res.redirect("/broken-acl/idor1?id=" + row["id"]);
                }
            })
    } else {
        if (username === "admin"){
            return res.send("ไม่สามารถใช้ username Admin ได้")
        }
        res.send("เกิดข้อผิดพลาดลองใหม่อีกครั้ง")
    }
});


router.get("/cookie-manipulation", async (req, res) => {
    res.render("broken-acl/idor2", { "err": undefined });
});

router.post("/cookie-manipulation", async (req, res) => {
    const { username, password, information, mode } = req.body;
    if (mode === "register") {
        db.get("SELECT COUNT(id) AS numId FROM user", (err, row) => {
            if (err) {
                console.log("error count:", err.message);
                res.render("broken-acl/idor2", { err: err.message });
            }
            const id = Number(row["numId"]) + 1;
            db.run("INSERT INTO user(id, username, password, information) VALUES (?,?,?,?)",
                [id, username, md5(password), information],
                (err) => {
                    if (err) {
                        console.log("err insert:", err.message);
                        res.render("broken-acl/idor2", { err: err.message });
                    } else {
                        res.cookie("username", username, { maxAge: 900000, httpOnly: true })
                        res.redirect("/broken-acl/cookie-manipulation/panel");
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
                    res.render("broken-acl/idor2", { err: message });
                } else {
                    res.cookie("username", username, { maxAge: 900000, httpOnly: true })
                    res.redirect("/broken-acl/cookie-manipulation/panel");
                }
            })
    } else {
        res.end();
    }
});

router.get("/cookie-manipulation/panel", async (req, res) => {
    if (req.cookies["username"] !== undefined) {
        db.get("SELECT * FROM user WHERE username=?",
            req.cookies["username"],
            (err, row) => {
                if (err || row === undefined) {
                    const message = err ? err.message : "user not exists";
                    res.clearCookie("username");
                    console.log("err sign-in:", message);
                    res.redirect("/broken-acl/cookie-manipulation");
                } else {
                    // console.log(row);
                    res.render("broken-acl/idor2-panel", {user: row});
                }
            })
    } else {
        res.redirect("/broken-acl/cookie-manipulation");
    }

});

module.exports = router;