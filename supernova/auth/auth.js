require('dotenv').config()
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;

var con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
});
  
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

con.query("USE amethyst", function(err, result) {
    if (err) throw err;
    console.log("Database selected");
});

module.exports = {
    register: function (name, email, password) {
        return new Promise(function(resolve, reject){
            con.query("SELECT * FROM users WHERE email = ?", email, function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    resolve(false);
                }
                else {
                    bcrypt.hash(password, saltRounds, function(err, hash) {
                        if(err) throw err;
                        con.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hash], function (err, result) {
                            if (err) throw err;
                            resolve(result);
                        });
                    });
                    console.log("User registered");
                }
            });
        });
    },

    login: function (email, password){
        return new Promise(function(resolve, reject){
            con.query("SELECT * FROM users WHERE email = ?", email, function (err, dbResult) {
                if (err) throw err;
                if (dbResult.length > 0){
                    bcrypt.compare(password, dbResult[0].password, function(err, result){
                        if (err) throw err;
                        let sessionId = generateSessionId();
                        if(!result) resolve(false);
                        saveSessionId(sessionId, email);
                        resolve(sessionId);
                    });
                }
                else {
                    console.log("Incorrect credentials");
                    resolve(false);
                }
            });
        });
    },
    
    checkSession: function (sessionId){
        return new Promise(function(resolve, reject){
            con.query("SELECT * FROM users WHERE sessionId = ?", sessionId, function (err, dbResult) {
                if (err) throw err;
                if (dbResult.length > 0){
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }
}

function generateSessionId() {
    return crypto.randomBytes(128).toString('hex');
}

function saveSessionId(sessionId, email){
    return new Promise(function(resolve, reject){
        con.query("UPDATE users SET sessionid = ? WHERE email = ?", [sessionId, email], function (err, result) {
            if (err) throw err;
            resolve(result);
        });
    });
}
