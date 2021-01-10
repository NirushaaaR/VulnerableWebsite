const jwt = require('jsonwebtoken');
const { sequelize } = require('../db/setup');

function verifyTokenCookie(req, res, next) {
    token = req.cookies["store-token"];
    if (token !== undefined) {
        try {
            const decode = jwt.verify(token, 'secret');
            req.userid = decode.userid;
            next();
        } catch (err) {
            next(new Error("token ผิด"))
        }
    } else {
        next(new Error("ยังไม่ได้ล็อคอิน"));
    }
}

async function checkLoginUser(req, res, next) {
    if (req.userid === undefined) {
        return next(new Error("ยังไม่ได้ล็อคอิน"));
    }

    const user = await sequelize.models.User.findOne({ where: { id: req.userid } });
    if (user === null) {
        res.clearCookie("store-token");
        next(new Error("เกิดข้อผิดพลาดล็อคอินใหม่"))
    } else {
        req.user = user;
        next();
    }
}

async function checkUserIsAdmin(req, res, next) {
    const user = req.user;
    if (user && user.admin) {
        next()
    } else {
        req.user = user;
        next(new Error("คุณไม่ใช่ Admin!!"));
    }
}

module.exports = {
    checkToken: verifyTokenCookie,
    checkUesr: [verifyTokenCookie, checkLoginUser],
    checkAdmin: [verifyTokenCookie, checkLoginUser, checkUserIsAdmin]
}