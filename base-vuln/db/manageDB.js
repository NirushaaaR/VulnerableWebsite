const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/sqlite.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

// create db
function initNewDb() {
    console.log("create new DB");
    db.serialize(function () {
        db.run("DROP TABLE IF EXISTS quiz")
        db.run("CREATE TABLE quiz (id TEXT, name TEXT, answer TEXT)");
    });
}

module.exports = {db, initNewDb} 