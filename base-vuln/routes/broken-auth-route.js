const router = require('express').Router();
const { brokenAuthDb } = require('../db/manageDB');
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



module.exports = router;