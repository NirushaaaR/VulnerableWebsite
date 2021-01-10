const { sequelize } = require('../db/setup');
const flag = require('../vars/flag');
const libxmljs = require('libxmljs2');
const fs = require('fs');

exports.home = async (req, res) => {
    const reviews = (await sequelize.query(
        "SELECT firstname, lastname, username, shopReview FROM Users where shopReview is not null"))[0];
    const products = (await sequelize.query(
        "SELECT name, price, star, image FROM Products"))[0];;
    res.render("index", { reviews, products });
};

exports.about = async (req, res) => {
    res.render("about");
}

exports.complain = (req, res, next) => {
    try {
        if (req.file && req.file.mimetype.includes('xml')) {
            // const data = fs.readFileSync(req.file.path);
            let data = "";
            req.file.buffer.forEach(b => {
                data += String.fromCharCode(b);
            })
            var content = libxmljs.parseXmlString(data, { noblanks: true, nocdata: true, noent: true });
            let message = ""
            content.root().childNodes().forEach(c => {
                message += c.text() + " ";
            });
            if (message.includes("nobody:x:65534:65534:nobody")){
                message += ` ${flag.UNUSED_PATH_XXE}`;
            }
            res.send("คำร้องเรียนของคุณกำลังรับการพิจารณา: " + message);
        } else if (req.body.title && req.body.text) {
            const message = String(req.body.title) + " " + String(req.body.text);
            res.send("คำร้องเรียนของคุณกำลังรับการพิจารณา: " + message);
        } else {
            res.redirect('about');
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};