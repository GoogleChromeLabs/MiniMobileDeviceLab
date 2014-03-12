var mysql = require('mysql');
var connection = null;

var tables = [
    'CREATE TABLE IF NOT EXISTS devices (' +
    'id INT NOT NULL AUTO_INCREMENT,' +
    'PRIMARY KEY(id),' +
    'user_id TEXT NOT NULL,' +
    'device_name TEXT NOT NULL,' +
    'device_nickname TEXT NOT NULL,' +
    'platform_id INT NOT NULL,' +
    'platform_version TEXT NOT NULL,' +
    'cloud_msg_id TEXT NOT NULL' +
    ')'
];

exports.openDb = function(successCb, errorCb) {
    if(connection !== null) {
        successCb(connection);
        return;
    }

    connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'firelin',
        port: 3306
        //port: 8891
    });

    connection.connect();

    connection.query('CREATE DATABASE IF NOT EXISTS minimobiledevicelab', function (err) {
        if (err) {
            throw err;
        }

        connection.query('USE minimobiledevicelab', function (err) {
            if (err) {
                throw err;
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
