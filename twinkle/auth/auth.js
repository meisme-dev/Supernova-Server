require('dotenv').config()
const mysql = require('mysql');
const bcrypt = require('bcrypt');
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
    checkToken: function(token, email){
        return new Promise(function(resolve, reject){
            bcrypt.compare(token, email + password).then(function(result, err){
                if(err) throw err;
                resolve(result);
            });
        });
    },
    register: function (email, password) {
        return new Promise(function(resolve, reject){
            con.query("SELECT * FROM users WHERE email = ?", email, function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    resolve(false);
                }
                else {
                    bcrypt.hash(password, saltRounds, function(err, hash) {
                        if(err) throw err;
                        con.query("INSERT INTO users (email, password) VALUES ('?, ?')", [email, hash], function (err, result) {
                            if (err) throw err;
                            resolve(generateToken(email, password));
                        });
                    });
                    console.log("User registered");
                }
            });
        });
    },

    login: function (email, password){
        return new Promise(function(resolve, reject){
        con.query("SELECT * FROM users WHERE email = ?", email, function (err, result) {
            if (err) throw err;
            if (result.length > 0){
                bcrypt.compare(password, result[0].password,function(err, result){
                    if (err) throw err;
                    if (result) resolve(generateToken(email, password));
                    else resolve(false);
                });
            }
            else {
                console.log("Incorrect credentials");
                resolve(false);
            }
        });
    });
    }
}

function generateToken(email, password){
    return new Promise(function(resolve, reject){
        bcrypt.hash(email + password, saltRounds).then(function(result, err){
            if(err) throw err;
            resolve(result);
        });
    });
}
