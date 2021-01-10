const { sequelize } = require('../db/setup');
const flag = require('../vars/flag');

const browserTestXSS = async (url, waittime=0) => {

    const urlInAllowedHost = allowedHOST.some((ah) => url.includes(ah));
    if (!urlInAllowedHost) return false;

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    let result = false;
    try {
        const page = await browser.newPage();
        page.on('dialog', async dialog => {
            // check if there alert in the site
            result = true;
            await dialog.dismiss()
        });
        await page.goto(url);
        if (waittime > 0) {
            await page.waitForTimeout(waittime)
        }
        await page.close();
    } catch (error) {
        console.log("error:", error.message);
    } finally {
        await browser.close();
    }

    return result
}

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