const { sequelize } = require('../db/setup');
const flag = require('../vars/flag');

exports.brand = async (req, res) => {
    const search = req.query.search;
    const debug = Boolean(req.query.debug);
    let query = "SELECT id, name, desc, price, image, star FROM Products"
    if (search) {
        query += ` WHERE name like '%${search}%' OR desc like '%${search}%' OR price like '%${search}%'`
    }
    try {
        const products = (await sequelize.query(query))[0];
        console.log(products)
        res.render("brand", { products, error: undefined });
    } catch (error) {

        if (debug) {
            res.render("brand", { products: [], error: error.message + `; query: ${query};` + flag.SQL_ERROR_FLAG });
        } else {
            res.render("brand", { products: [], error: undefined });
        }
    }
}

exports.buyPhone = async (req, res) => {
    const phoneId = req.body.phoneId;
    const phone = await sequelize.models.Product.findOne({ where: { id: phoneId } });

    try {
        // check if phone exists
        if (phone === null) {
            return res.json({ message: "ไม่มีโทรศัพท์ id นั้น", success: false })
        }

        // check already buy phone
        const alreadyBuy = await sequelize.models.UserOwnProduct.count({ where: { ProductId: phone.id, UserId: req.user.id } });
        if (alreadyBuy > 0) {
            return res.json({ message: "คุณได้ซื้อโทรศัพท์เครื่องนี้ไปแล้วแบ่งให้คนอื่นบ้าง!!!", success: false })
        }

        if (phone.price < req.user.credit) {
            req.user.credit -= phone.price;
            // save new User Own Product
            await sequelize.models.UserOwnProduct.create({
                UserId: req.user.id,
                ProductId: phone.id,
            });
            await req.user.save()

            return res.json({ message: "คุณได้ซื้อ " + phone.name + " เรียบร้อยแล้ว", success: true });

        } else {
            return res.json({ message: "มีเงินไม่พอซื้อ...", success: false })
        }

    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", success: false });
    }
}