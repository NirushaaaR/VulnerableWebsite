const router = require('express').Router();

router.get("/client-side", async (req, res) => {
    return res.render("client-side/basic-js")
});

router.get("/js-obfusication", async (req, res) => {
    return res.render("client-side/obfusicate")
});

router.get("/requests", async (req, res) => {
    if (req.headers["user-agent"].includes("Opera/9.60")) {
        res.send("เฮ้คุณใช้ browser Opera นี่เอา FLAG ไป: FLAG{USER_AGENT_FROM_THE_BROWSER}")
    } else {
        res.send("คุณไม่ได้ใช้ Opera browser version 9.60 อย่างงั้นเหรอ!!!")
    }
});

router.patch("/requests", async (req, res) => {
    res.send("เฮ้นั่น PATCH request นี่เอา FLAG ไปเลย: FLAG{METHOD_OF_REQUESTS}")
});

function redirect(res, url, text) {
    var address = url;
    var body;
    var status = 302;

    // Set location header
    address = res.location(address).get('Location');

    // Support text/{plain,html} by default
    res.format({
        text: function () {
            body = text
        },

        html: function () {
            var u = escapeHtml(address);
            body = text
        },

        default: function () {
            body = '';
        }
    });

    // Respond
    res.statusCode = status;
    res.set('Content-Length', Buffer.byteLength(body));

    if (res.req.method === 'HEAD') {
        res.end();
    } else {
        res.end(body);
    }
};

// FLAG{REDIRECT_GOES_RIGHT_ROUND_RIGHT_ROUND}
// FLAG{ REDIR ECT_G OES_R IGHT_ ROUND _RIGH T_ROU ND}

router.get("/redirect", (req, res) => {
    return redirect(res, "redirect2", "FLAG{")
    // res.location("redirect2").send("some text")
});

router.get("/redirect2", (req, res) => {
    return redirect(res, "redirect3", "REDIR")
});

router.get("/redirect3", (req, res) => {
    return redirect(res, "redirect4", "ECT_R")
});

router.get("/redirect4", (req, res) => {
    return redirect(res, "redirect5", "IGHT_")
});

router.get("/redirect5", (req, res) => {
    return redirect(res, "redirect6", "ROUND")
});

router.get("/redirect6", (req, res) => {
    return redirect(res, "redirect7", "_RIGH")
});

router.get("/redirect7", (req, res) => {
    return redirect(res, "redirect8", "T_ROU")
});

router.get("/redirect8", (req, res) => {
    return redirect(res, "redirect9", "ND}")
});

router.get("/redirect9", (req, res) => {
    return res.send("ends here...")
})


module.exports = router;