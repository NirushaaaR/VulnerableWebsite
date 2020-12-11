const { MongoClient } = require('mongodb');

uri = "mongodb+srv://new_user31:dp0kona7qbL6PC9U@cluster0.qoyom.mongodb.net/vulnDb?retryWrites=true&w=majority"

MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
   
    const db = client.db(dbName);
   
    client.close();
  });