var mysql = require('mysql');
var config = require('./config.js');

var tables = [
    'CREATE TABLE IF NOT EXISTS devices (' +
    'id INT NOT NULL AUTO_INCREMENT,' +
    'PRIMARY KEY(id),' +
    'group_id TEXT NOT NULL,' +
    'device_name TEXT NOT NULL,' +
    'device_nickname TEXT NOT NULL,' +
    'platform_id INT NOT NULL,' +
    'platform_version TEXT NOT NULL,' +
    'cloud_msg_id TEXT NOT NULL' +
    ')',
    'CREATE TABLE IF NOT EXISTS urls ('+
    'id INT NOT NULL AUTO_INCREMENT,' +
    'PRIMARY KEY(id),' +
    'group_id TEXT NOT NULL,' +
    'url TEXT NOT NULL,' +
    'sort_order INT' +
    ')',
    'CREATE TABLE IF NOT EXISTS usergroups ('+
    'id INT NOT NULL AUTO_INCREMENT,'+
    'PRIMARY KEY(id),' +
    'user_id TEXT NOT NULL,'+
    'group_id INT NOT NULL DEFAULT -1'+
    ')',
    'CREATE TABLE IF NOT EXISTS loopstate ('+
    'id INT NOT NULL AUTO_INCREMENT,'+
    'PRIMARY KEY(id),'+
    'group_id INT NOT NULL'+
    ')'
];

function openDb(successCb, errorCb) {
    connection = mysql.createConnection(config.dbURL);
    connection.connect(function (err) {
        if (err) {
            console.error('db connection error: ' + err.stack);
            // retry after 1 sec
            setTimeout(openDb.bind(null, successCb, errorCb), 1000);
            return;
        }
        initDb(connection, successCb, errorCb);
    })
}

function initDb(connection, successCb, errorCb) {
    connection.query('CREATE DATABASE IF NOT EXISTS ' + config.dbName, function (err) {
        if (err) {
            errorCb(err);
            return
        }

        connection.query('USE ' + config.dbName, function (err) {
            if (err) {
                errorCb(err);
                return;
            }

            initTable(connection, 0, successCb, errorCb);
        });
    });
};

function initTable(connection, index, successCb, errorCb) {
    if(index >= tables.length) {
        successCb(connection);
        return;
    }

    connection.query(tables[index],
        function (err) {
            if (err) {
                errorCb(err);
                return;
            }

            index++;
            initTable(connection, index, successCb, errorCb);
        });
}

exports.openDb = openDb;
