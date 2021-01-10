const { Sequelize, DataTypes } = require('sequelize');
const md5 = require('md5');
const flag = require('../vars/flag');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${__dirname}/database.sqlite`
});

const User = sequelize.define('User', {
    // Model attributes are defined here
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING
        // allowNull defaults to true
    },
    username: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    credit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    shopReview: {
        type: DataTypes.STRING
    }
});

const Product = sequelize.define('Product', {
    // Model attributes are defined here
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    desc: {
        type: DataTypes.STRING
        // allowNull defaults to true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    star: {
        type: DataTypes.INTEGER,
    },
    image: {
        type: DataTypes.STRING
    }
});

const UserOwnProduct = sequelize.define('UserOwnProduct', {
    review: {
        type: DataTypes.STRING,
    }
});

const Secret = sequelize.define('Secret', {
    text: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
})

// owning
User.belongsToMany(Product, { through: UserOwnProduct });
Product.belongsToMany(User, { through: UserOwnProduct });

async function initDb() {
    await sequelize.sync({ force: true });

    // all other seed data here...
    const users = [
        {
            firstName: "John",
            lastName: "Doe",
            username: "admin",
            password: md5("1234567890"),
            admin: true,
            shopReview: "ในฐานะผู้ดูแลเว็บไซต์แห่งนี้ ต้องบอกเลยว่าโทรศัพท์ที่เอามาขายที่นี้มีแต่ของที่คุณภาพดีทั้งนั้น ผมละชอบจริงๆ ทุกบาททุกสตางค์ที่เสียไปคุ้มค่าแน่นอน",
            credit: 1000000000000,
        },
        {
            firstName: "Janey",
            lastName: "Dee",
            username: "janifirrr",
            password: md5("asdasdMKKKLspxxx1258621ss;;"), // make it hard for any kind of guessing
            shopReview: "หลังจากได้ใช้บริการร้านแห่งนี้แล้วก็ทำให้รู้ว่า โทรศัพท์ที่มีคุณภาพดีนั้นควรเป็นแบบไหน ทั้งรวดเร็ว พกพาสะดวก และไม่ติดขัด ถึงโทรศัพท์จะแพงแต่คุ้มค่าทุกราคาแน่นอน",
            credit: 1000000000000,
        }
    ];

    const products = [
        {
            name: "Andriod 20.0",
            desc: "Andriod จากโลกอนาคตรองรับความจุ 100 TB, 50GB RAM, ทำงานได้รวดเร็วว่องไวได้ใจทุกคน!!",
            price: 10000000.00,
            image: "public/images/1.png",
            star: 4
        },
        {
            name: "IPHONE 20x",
            desc: "IPHONE จากโลกอนาคตรองรับความจุ 100 TB, 50GB RAM, ทำงานได้รวดเร็วว่องไวได้ใจทุกคน!!",
            price: 10000000.00,
            image: "public/images/2.png",
            star: 5
        },
        {
            name: "IPHONE 30x",
            desc: "IPHONE จากโลกอนาคตรองรับความจุ 100 TB, 50GB RAM, ทำงานได้รวดเร็วว่องไวได้ใจทุกคน!!",
            price: 10000000.00,
            image: "public/images/3.png",
            star: 5
        },
        {
            name: "IPHONE 40x",
            desc: "IPHONE จากโลกอนาคตรองรับความจุ 100 TB, 50GB RAM, ทำงานได้รวดเร็วว่องไวได้ใจทุกคน!!",
            price: 10000000.00,
            image: "public/images/4.png",
            star: 4
        },
        {
            name: "IPHONE 50x",
            desc: "IPHONE จากโลกอนาคตรองรับความจุ 100 TB, 50GB RAM, ทำงานได้รวดเร็วว่องไวได้ใจทุกคน!!",
            price: 10000000.00,
            image: "public/images/5.png",
            star: 3
        },
        {
            name: "IPHONE 60x",
            desc: "IPHONE จากโลกอนาคตรองรับความจุ 100 TB, 50GB RAM, ทำงานได้รวดเร็วว่องไวได้ใจทุกคน!!",
            price: 10000000.00,
            image: "public/images/6.png",
            star: 5
        },
    ]

    const query = [
        User.bulkCreate(users),
        Product.bulkCreate(products),
        Secret.create({ text: flag.SECRET_IN_DATABASE }),
    ]
    await Promise.all(query);
}

module.exports = { sequelize, initDb };