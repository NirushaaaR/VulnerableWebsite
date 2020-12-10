const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

let db = new sqlite3.Database(__dirname + '/sqlite.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the sqlite database.');
});

// create db
function initNewDb() {
    console.log("create new DB");
    db.serialize(function () {
        db.run("DROP TABLE IF EXISTS quiz");
        db.run("DROP TABLE IF EXISTS gift");
        db.run("DROP TABLE IF EXISTS secret");
        db.run("DROP TABLE IF EXISTS user");

        db.run("CREATE TABLE quiz (id INTEGER NOT NULL PRIMARY KEY, name TEXT, answer TEXT)");
        db.run("CREATE TABLE gift (id INTEGER NOT NULL PRIMARY KEY, person TEXT, want TEXT)");
        db.run("CREATE TABLE secret (flag TEXT)");
        db.run("CREATE TABLE user (username TEXT, password TEXT, email TEXT, name TEXT, bio TEXT, isAdmin boolean)");

        const giftLists = [
            [1, "bruce", "macbook"],
            [2, "max", "pencil"],
            [3, "tab", "card"],
            [4, "kristoph", "FLAG{INJECTING_THE_SQL_COMMAND}"]
        ]
        const command = "INSERT INTO gift(id, person, want) VALUES " + giftLists.map(
            d => `(${d[0]}, "${d[1]}", "${d[2]}")`).join(",");
        db.run(command);

        const flag = "FLAG{UNION_SELECT_ATTACK}"
        db.run("INSERT INTO secret(flag) VALUES (?)", flag);
        const users = [
            ["admin", md5(`Zg9O2Q2Jdm9XCv6v`), "admin@mail.com", "admin master", "I'm the admin!!", true],
            ["user", md5(`123456`), "user@mail.com", "user staff", "I'm not the admin!!", false],
        ]
        const userCommand = "INSERT INTO user(username, password, email, name, bio, isAdmin) VALUES " + users.map(
            u => `("${u[0]}", "${u[1]}", "${u[2]}", "${u[3]}", "${u[4]}", "${u[5]}")`).join(",");
        db.run(userCommand);

    });
}

module.exports = { db, initNewDb } 