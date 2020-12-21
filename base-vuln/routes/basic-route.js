const router = require('express').Router();

router.get("/client-side", async (req, res) => {
    return res.render("client-side/basic-js")
});

router.get("/js-obfusication", async (req, res) => {
    return res.render("client-side/obfusicate")
});

module.exports = router;