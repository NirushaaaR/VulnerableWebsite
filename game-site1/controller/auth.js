const { sequelize } = require('../db/setup');
const { createUser } = require('../db/function');
const flag = require('../vars/flag');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');

function assingToken(user, res) {
    // gen jwt using user id
    const token = jwt.sign({ userid: user.id, admin: user.admin }, "secret");
    // assing it to cookies
    res.cookie('store-token', token);
    // that's it...
    return token;
}

async function textxss(token) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    let result = false;
    try {
        const page = await browser.newPage();
        await page.setCookie({ name: 'store-token', value: token, domain: '127.0.0.1' });
        page.on('dialog', async dialog => {
            result = true;
            await dialog.dismiss()
        });
        await page.goto("http://127.0.0.1:11000/profile");
        await page.close();
    } catch (error) {
        console.log("error:", error.message);
    } finally {
        await browser.close();
    }

    return result;
}

exports.getLogin = async (req, res) => {
    res.render("login", { error: undefined });
}

exports.postLogin = async (req, res) => {
    try {
        const username = req.body.username;
        const password = md5(req.body.password);
        const user = await sequelize.models.User.findOne({ where: { username, password } });
        if (user === null) {
            throw new Error("username หรือ password ไม่ถูกต้อง");
        }
        assingToken(user, res);
        let nextRoute = "profile"
        if (user.username === "admin") {
            nextRoute += `?flag=login%20ด้วย%20week%20password%20${flag.LOGIN_ADMIN_WEEK_PASSWORD}`
        }
        res.redirect(nextRoute);
    } catch (error) {
        let message = error.message;
        res.render("login", { error: message });
    }

}

exports.getRegister = async (req, res) => {
    res.render("register", { error: undefined });
}

exports.postRegister = async (req, res) => {
    try {
        req.body.password = md5(req.body.password);
        const user = await createUser(req.body);
        const token = assingToken(user, res);
        const xss = await textxss(token);
        let redirect = 'profile';
        if (xss) {
            redirect += `?flag=alert%20หน้า%20profile%20${flag.XSS_IN_PROFILE_PAGE}`
        }
        res.redirect(redirect);
    } catch (error) {
        let message = error.message;
        if (error.message === "Validation error") {
            message = "username นี้ถูกใช้ไปแล้ว";
        }
        return res.render("register", { error: message });
    }

}

exports.logout = async (req, res) => {
    // just remove cookie
    res.clearCookie("store-token");
    res.redirect("/");
}