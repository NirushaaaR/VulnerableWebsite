const puppeteer = require('puppeteer');

exports.browserEnterXSS2 = async (randomId) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setCookie({ name: 'secret', value: 'FLAG{HERE_HAVE_SOME_COOKIE}', domain: '127.0.0.1' });
        // console.log("before enter site")
        page.on('dialog', async dialog => {
            // in case person use alert function
            await dialog.dismiss()
        });
        await page.goto(`http://127.0.0.1:8000/xss/xss2?answerid=${randomId}`);
        await page.waitForTimeout(1000);
        // console.log("after enter site")
    } catch (error) {
        console.error("error", error);
    } finally {
        await browser.close();
    }
}

exports.browserEnterXSS1 = async (code) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        page.on('dialog', async dialog => {
            code += "<script>alert('Here is Your Flag: FLAG{REMOVE_SCRIPT_IS_NOT_ENOUGHT}')</script>";
            await dialog.dismiss()
        });
        await page.goto(`http://127.0.0.1:8000/xss/xss1?code=${code}`);
        await page.close();
    } catch (error) {
        console.log("error:", error.message);
    } finally {
        await browser.close();
    }

    return code
}

exports.browserTestXSS = async (url) => {
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
        await page.close();
    } catch (error) {
        console.log("error:", error.message);
    } finally {
        await browser.close();
    }

    return result
}