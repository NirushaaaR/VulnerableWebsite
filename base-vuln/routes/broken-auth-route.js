const router = require('express').Router();
const { brokenAuthDb } = require('../db/manageDB');
const jwt = require('jsonwebtoken');
const md5 = require('md5');

router.get("/blog", async (req, res) => {
    brokenAuthDb.all("SELECT * FROM blog", (err, rows) => {
        if (err) {
            console.error("error:", err);
            return res.send("error happends wait a bit for it to resolve")
        }
        return res.render("broken-auth/blog", { blogs: rows })
    });
});

router.get("/blog/:id", async (req, res) => {
    const id = req.params.id;
    brokenAuthDb.get("SELECT * FROM blog WHERE id=?", id, (err, row) => {
        if (err) {
            console.error("error:", err);
            return res.send("error happends wait a bit for it to resolve")
        }
        if (row) {
            return res.render("broken-auth/blog-detail", { blog: row });
        } else {
            return res.status(404).send("blog not exists")
        }
    })
});

router.get("/blog-login", async (req, res) => {
    return res.render("broken-auth/blog-login", { flag: undefined, err: undefined });
});

router.post("/blog-login", async (req, res) => {
    const { username, password } = req.body;
    brokenAuthDb.get("SELECT * FROM user WHERE username=? AND password=?",
        [username, md5(password)],
        (err, row) => {
            if (err || row === undefined) {
                const message = err ? err.message : "user not exists";
                console.log("err sign-in:", message);
                return res.render("broken-auth/blog-login", { flag: undefined, err: message });
            }

            return res.render("broken-auth/blog-login", { flag: "FLAG{QUESTION_TOO_EASY}", err: undefined });
        })
});

router.get("/forget-password", async (req, res) => {
    return res.render("broken-auth/blog-forget-password", { err: undefined });
});

router.post("/forget-password", async (req, res) => {
    const { username, password, question, answer } = req.body;
    brokenAuthDb.get("SELECT * FROM user WHERE username=?", username, (err, row) => {
        if (err || row == undefined) {
            const message = err ? err.message : "ไม่พบ username นี้ในระบบ";
            console.log("err sign-in:", message);
            return res.render("broken-auth/blog-forget-password", { err: message });
        }

        if (row.question === question && row.answer === answer) {
            brokenAuthDb.run("UPDATE user SET password=? WHERE id=?", [md5(password), row.id], (err) => {
                if (err) {
                    console.log("error:", err);
                    return res.render("broken-auth/blog-forget-password", { err: err.message });
                }
                return res.render("broken-auth/blog-forget-password", { err: "รหัสผ่านคุณได้รับการเปลี่ยนใหม่แล้ว" });
            })
        } else {
            return res.render("broken-auth/blog-forget-password", { flag: undefined, err: "คำถามและคำตอบไม่ตรงกับที่คุณตั้งไว้" });
        }
    });
});


router.get("/scratch-pad", async (req, res) => {
    if (req.cookies.token) {
        // decode token
        const decode = jwt.decode(req.cookies.token, "secret");
        // get user data here
        brokenAuthDb.get("SELECT * FROM user_scratch WHERE username=?", decode.username, (err, row) => {
            if (err) {
                const message = err.message;
                return res.render("broken-auth/scratch-pad", { message: message, user: undefined });
            }
            else if (row === undefined) {
                // token is invalid!!!
                res.clearCookie("token");
                return res.render("broken-auth/scratch-pad", { message: "token ผิดสมัคร User ใหม่", user: undefined });
            } else {
                return res.render("broken-auth/scratch-pad", { user: row, message: undefined });
            }
        });
    } else {
        res.render("broken-auth/scratch-pad", { user: undefined, message: undefined });
    }
});

router.post("/scratch-pad", async (req, res) => {
    // admin can't save note
    if (req.cookies.token) {
        // decode token
        const note = req.body.note;
        const decode = jwt.decode(req.cookies.token, "secret");
        // get user data here
        if (decode.username === "admin") {
            return res.redirect("/broken-auth/scratch-pad");
        } else {
            // save note of other user
            brokenAuthDb.run("UPDATE user_scratch SET note=? WHERE username=?", [note, decode.username], (err) => {
                if (err) {
                    const message = err.message;
                    return res.render("broken-auth/scratch-pad", { message: message, user: undefined });
                }
                return res.redirect("/broken-auth/scratch-pad");
            });
        }

    } else {
        res.status(403).send("Forbidden");
    }
});

router.post("/scratch-pad-login", async (req, res) => {
    const { username, password } = req.body;
    brokenAuthDb.get("SELECT * FROM user_scratch WHERE username=?", username, (err, row) => {
        if (err) {
            const message = err.message;
            return res.render("broken-auth/scratch-pad", { message: message, user: undefined });
        }
        else if (row === undefined) {
            // create new user here
            brokenAuthDb.run("INSERT INTO user_scratch(username, password, note) VALUES (?, ?, ?)", [username, md5(password), "โน้ตของคุณที่นี่"], (err) => {
                if (err) {
                    const message = err.message;
                    return res.render("broken-auth/scratch-pad", { message: message, user: undefined });
                }
                // create jwt here too
                const token = jwt.sign({ username: username }, "secret");
                res.cookie("token", token, { maxAge: 900000, httpOnly: true });
                return res.redirect("/broken-auth/scratch-pad");
            });
        } else if (row.password == md5(password)) {
            // create jwt here
            const token = jwt.sign({ username: username }, "secret");
            res.cookie("token", token, { maxAge: 900000, httpOnly: true });
            return res.redirect("/broken-auth/scratch-pad");
        } else {
            // wrong password
            return res.render("broken-auth/scratch-pad", { message: "password ผิดเปลี่ยนไปใช้ username อื่นซะ", user: undefined });
        }

    });
});


router.get("/panel-login", async (req, res) => {
    res.render("broken-auth/panel-login", { err: undefined })
});

router.post("/panel-login", async (req, res) => {
    const { username, password } = req.body;
    brokenAuthDb.get("SELECT * from user_weakpass WHERE username=? AND password=?", [username, md5(password)], (err, row) => {
        if (err || row === undefined) {
            const message = err ? err.message : "ไม่พบ user, password ในระบบ";
            console.log("err sign-in:", message);
            return res.render("broken-auth/panel-login", { err: message });
        }

        const token = jwt.sign({ username: username }, "THIS_IS_A_SECRET_THAT_NOT_EASILY_CRACKED");
        res.cookie("tokenpanel", token, { maxAge: 900000, httpOnly: true });
        // set jwt as admin and redirect
        return res.redirect("/broken-auth/panel");
    });
});

router.get("/panel", async (req, res) => {
    if (req.cookies.tokenpanel) {
        const decode = jwt.decode(req.cookies.tokenpanel, "THIS_IS_A_SECRET_THAT_NOT_EASILY_CRACKED");
        // get user data here
        brokenAuthDb.get("SELECT * FROM user_weakpass WHERE username=?", decode.username, (err, row) => {
            if (err) {
                const message = err.message;
                console.log("error:", message);
                return res.redirect("/broken-auth/panel-login");
            }
            else if (row === undefined) {
                // token is invalid!!!
                res.clearCookie("tokenpanel");
                return res.redirect("/broken-auth/panel-login");
            } else {
                return res.render("broken-auth/panel", { user: row });
            }
        });
    } else {
        return res.redirect("/broken-auth/panel-login");
    }
});


module.exports = router;