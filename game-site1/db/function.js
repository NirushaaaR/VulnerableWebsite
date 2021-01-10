const {sequelize, initDb} = require('./setup');

// fail safe when there's too much user creation...
let countUser = 0;
const LIMITUSER = 1000;

exports.createUser = async function(value) {
    if (++countUser > LIMITUSER){
        await initDb();
        countUser = 0;
    }
    return await sequelize.models.User.create(value);
}