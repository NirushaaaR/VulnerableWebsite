const { sequelize } = require('../db/setup');
const flag = require('../vars/flag');

exports.admin = async (req, res) => {
    res.render("admin");
}

exports.profile = async (req, res) => {
    const ownProducts = (await sequelize.query(`SELECT * FROM UserOwnProducts JOIN Products on Products.id=UserOwnProducts.ProductId WHERE UserOwnProducts.UserId=${req.userid}`))[0];
    console.log(ownProducts);
    // check own all phones
    const phoneCount = await sequelize.models.Product.count();
    const haveAllPhone = phoneCount === ownProducts.length;

    res.render("profile", { 
        user: req.user, 
        flag_user_admin: flag.REGISTER_ADMIN_USER, 
        ownPhone: ownProducts, 
        flag_allphone: haveAllPhone ? flag.BUY_ALL_PHONE : "",
        flag_decode_token: flag.DECODE_THE_TOKEN,
    });
}