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
        res.send("คุณไม่ได้ใช้ Opera browser version 9.60 อย่างงั้นเหรอ แย่มาก!!!")
    }
});

router.patch("/requests", async (req, res) => {
    res.send("เฮ้นั่น PATCH request นี่เอา FLAG ไปเลย: FLAG{METHOD_OF_REQUESTS}")
});

// FLAG{REDIRECT_GOES_RIGHT_ROUND_RIGHT_ROUND}
// FLAG{ REDIR ECT_G OES_R IGHT_ ROUND _RIGH T_ROU ND}
// FLAG{SCRIPTING_LIKE_A_PRO}

const SCRIPT_FLAG = "LAG{SCRIPTING_LIKE_A_PRO}";
const randomIdRemeber = {};
let randomId = Math.floor((1 + Math.random()) * 1000);
let currentRandomId = 0;
const payload = [{ flag: 'F', next: randomId, current: '/script' }];

for (let i = 0; i < SCRIPT_FLAG.length; i++) {
    currentRandomId = randomId;
    randomId = Math.floor((1 + Math.random()) * 1000)
    while (randomIdRemeber[randomId]) {
        randomId = Math.floor((1 + Math.random()) * 1000)
    }
    if (i === SCRIPT_FLAG.length - 1) {
        randomId = null;
    }
    payload.push({
        flag: SCRIPT_FLAG[i],
        next: randomId,
        current: "/script/" + currentRandomId
    });
    randomIdRemeber[randomId] = true;
}

payload.forEach(p => {
    router.get(p.current, (req, res) => {
        return res.json({ flag: p.flag, next: p.next });
    });
});


module.exports = router;