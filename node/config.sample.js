exports.dbURL = process.env.MMDL_DB_URL || {
		host     : 'localhost',
 		user     : '<username>',
 		password : '<password>',
 		port: 0000
 	};
exports.dbName = process.env.MMDL_DB_NAME || 'minimobiledevicelab';
exports.gplusClientId = '<G+ Client ID>';
exports.webhookurl = process.env.MMDL_PUSH_WEBHOOK_URL || null;