const mysql= require('mysql');

const connection =mysql.createConnection({
    host:"localhost",
    user:"root",
    database: "login-regist",
    password:""
});

connection.connect();

module.exports=connection;

