const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

let db = new sqlite3.Database(__dirname + '/sqlite.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the sqlite database.');
});

let sqliDB = new sqlite3.Database(__dirname + '/sqli.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the sqli database.');
});

let brokenAuthDb = new sqlite3.Database(__dirname + '/brokenAuth.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the brokenAuthDb database.');
})

// create db
function initNewDb() {
    console.log("create new DB");
    db.serialize(function () {
        db.run("DROP TABLE IF EXISTS quiz");
        db.run("DROP TABLE IF EXISTS user");

        db.run("CREATE TABLE quiz (id INTEGER NOT NULL PRIMARY KEY, name TEXT, answer TEXT)");
        db.run("CREATE TABLE user (id INTEGER NOT NULL PRIMARY KEY, username TEXT, password TEXT, information TEXT, isAdmin BOOLEAN City varchar(255) DEFAULT 'false')");

        const usersLists = [
            [1, "admin", md5(`Plnd64Op12ffs`), "I am the admin!!!", true]
        ];
        const command = "INSERT INTO user(id, username, password, information, isAdmin) VALUES " + usersLists.map(
            d => `(${d[0]}, "${d[1]}", "${d[2]}", "${d[3]}", "${d[4]}")`).join(",");
        db.run(command);
    });

    sqliDB.serialize(function () {
        sqliDB.run("DROP TABLE IF EXISTS gift");
        sqliDB.run("DROP TABLE IF EXISTS secret");
        sqliDB.run("DROP TABLE IF EXISTS user");

        sqliDB.run("CREATE TABLE gift (id INTEGER NOT NULL PRIMARY KEY, person TEXT, want TEXT)");
        sqliDB.run("CREATE TABLE secret (flag TEXT)");
        sqliDB.run("CREATE TABLE user (username TEXT, password TEXT, email TEXT, name TEXT, bio TEXT, isAdmin boolean)");

        const giftLists = [
            [1, "bruce", "macbook"],
            [2, "max", "pencil"],
            [3, "tab", "card"],
            [4, "kristoph", "FLAG{INJECTING_THE_SQL_COMMAND}"]
        ]
        const command = "INSERT INTO gift(id, person, want) VALUES " + giftLists.map(
            d => `(${d[0]}, "${d[1]}", "${d[2]}")`).join(",");
        sqliDB.run(command);

        const flag = "FLAG{UNION_SELECT_ATTACK}"
        sqliDB.run("INSERT INTO secret(flag) VALUES (?)", flag);
        const users = [
            ["admin", md5(`Zg9O2Q2Jdm9XCv6v`), "admin@mail.com", "admin master", "I'm the admin!!", true],
            ["user", md5(`123456`), "user@mail.com", "user staff", "I'm not the admin!!", false],
        ]
        const userCommand = "INSERT INTO user(username, password, email, name, bio, isAdmin) VALUES " + users.map(
            u => `("${u[0]}", "${u[1]}", "${u[2]}", "${u[3]}", "${u[4]}", "${u[5]}")`).join(",");
        sqliDB.run(userCommand);

    });

    brokenAuthDb.serialize(function () {
        brokenAuthDb.run("DROP TABLE IF EXISTS user");
        brokenAuthDb.run("DROP TABLE IF EXISTS user_weakpass");
        brokenAuthDb.run("DROP TABLE IF EXISTS user_scratch");
        brokenAuthDb.run("DROP TABLE IF EXISTS blog");

        brokenAuthDb.run("CREATE TABLE user(id INTEGER NOT NULL PRIMARY KEY, username TEXT, password TEXT, question TEXT, answer TEXT)");
        brokenAuthDb.run("CREATE TABLE user_weakpass(id INTEGER NOT NULL PRIMARY KEY, username TEXT, password TEXT, information TEXT)");
        brokenAuthDb.run("CREATE TABLE user_scratch(username TEXT, password TEXT, note TEXT)");
        brokenAuthDb.run("CREATE TABLE blog(id INTEGER NOT NULL PRIMARY KEY, title TEXT, description TEXT, by TEXT)");

        const users = [
            [1, "admin", md5(`Zg9O2Q2Jdm9XCv6vsss`), "ชื่อของสัตว์เลี้ยงที่ชอบ", "บักกี้"],
        ]
        const userCommand = "INSERT INTO user(id, username, password, question, answer) VALUES " + users.map(
            u => `("${u[0]}", "${u[1]}", "${u[2]}", "${u[3]}", "${u[4]}")`).join(",");
        brokenAuthDb.run(userCommand);

        const blog = [
            [1, "บล็อกใหม่ของโผมมม", "ผมได้สร้างบล็อคของตัวเองเป็นครั้งแรกสุดยอดไปเลยยย"],
            [2, "วันนี้เป็นวันที่ดีจริง ๆ", "ท้องฟ้าแจ่มใส อากาศปลอดโปร่ง ภายใต้ร่มเงาไม้ใหญ่ ให้ความรู้สึกสดชื่นมักๆ"],
            [3, "น้องหมาาา", "ผมเลี้งหมาด้วยนะ รู้รึเปล่า หมาผมชื่อ 'บักกี้' มันน่ารักมากๆเลย ถ้าโพสรูปได้ผมโพสไปแล้ว T_T"],
            [4, "ธรรมะ กระตุกจิต กระชากใจ", "คำคมวันนี้ ถ้ารู้คิดก็เป็นอรหันต์ ถ้าไม่รู้คิดก็ตกนรก"],
        ]
        const blogCommand = "INSERT INTO blog(id, title, description, by) VALUES " + blog.map(
            u => `("${u[0]}", "${u[1]}", "${u[2]}", "admin")`).join(",");
        brokenAuthDb.run(blogCommand);

        const usersScratch = [
            ["admin", md5(`Zg9O2Q2Jdm9XCvdasdas6v`), "ว้าวเป็นที่เก็บความลับได้อย่างดีเลย นี่ไงหล่่ะความลับของฉัน FLAG{JWT_IS_SUPER_RELIABLE}"],
        ]
        const usersScratchCommand = "INSERT INTO user_scratch(username, password, note) VALUES " + usersScratch.map(
            u => `("${u[0]}", "${u[1]}", "${u[2]}")`).join(",");
        brokenAuthDb.run(usersScratchCommand);

        const userWeakpass = [
            [1, "admin", md5(`iloveu`), "ดูเว็บที่ฉันสร้างนี่สิ มันสุดแสนจะปลอดภัยหายห่วงไร้กังวล ไม่โดนแฮ็คแน่นอน FLAG{MY_PASSWORD_IS_PLENTY_STRONG}"],
        ]
        const userWeakpassCommand = "INSERT INTO user_weakpass(id, username, password, information) VALUES " + userWeakpass.map(
            u => `("${u[0]}", "${u[1]}", "${u[2]}", "${u[3]}")`).join(",");
        brokenAuthDb.run(userWeakpassCommand);
    })
}

module.exports = { db, initNewDb, sqliDB, brokenAuthDb } 