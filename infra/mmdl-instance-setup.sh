# Script for initializing a replica instance:
# - create /apps/bin/update.sh script
# - create /apps/bin/github-push-to-deploy.js
# - update default nginx-backed site configuration
# - update nodejs apps

mkdir -p /apps/bin
echo 'apps ALL=(ALL) NOPASSWD: /etc/init.d/nginx' >> /etc/sudoers
echo 'www-data ALL=(ALL) NOPASSWD: /apps/bin/update.sh' >> /etc/sudoers

cat <<EOF > /apps/bin/update.sh
#!/bin/bash

REPO_URL=https://github.com/GoogleChrome/MiniMobileDeviceLab.git
APP_DIR=/apps/mmdl
META_URL=http://metadata/computeMetadata/v1/instance/attributes

function get_meta {
    v=\$(curl -f -s -H 'Metadata-Flavor: Google' \$META_URL/\$1)
    echo \$v
}

DB_HOST=\$(get_meta MMDL_DB_HOST)
DB_PORT=\$(get_meta MMDL_DB_PORT)
DB_NAME=\$(get_meta MMDL_DB_NAME)
DB_USER=\$(get_meta MMDL_DB_USER)
DB_PASSWORD=\$(get_meta MMDL_DB_PASSWORD)
GPLUS_CLIENT_ID=\$(get_meta MMDL_GPLUS_CLIENT_ID)
GCM_CLIENT_ID=\$(get_meta MMDL_GCM_CLIENT_ID)
WEBHOOK_URL=\$(get_meta MMDL_WEBHOOK_URL)
WEBHOOK_SECRET=\$(get_meta MMDL_WEBHOOK_SECRET)

if [ ! -d \$APP_DIR ]; then
    git clone \$REPO_URL \$APP_DIR
fi

cd \$APP_DIR
git reset --hard origin/master && git pull
cat <<EOC > node/config.js
exports.dbURL = {
    host     : '\$DB_HOST',
    user     : '\$DB_USER',
    password : '\$DB_PASSWORD',
    port     : \$DB_PORT
};
exports.dbName = '\$DB_NAME';
exports.gplusClientId = '\$GPLUS_CLIENT_ID';
exports.gcmClientId = '\$GCM_CLIENT_ID';
exports.webhookurl = '\$WEBHOOK_URL';
exports.webhookSecret = '\$WEBHOOK_SECRET';
EOC

cd node && npm install
forever stop --plain \$APP_DIR/node/app.js
forever start --plain \$APP_DIR/node/app.js

cd \$APP_DIR/web-front-end && npm install
cd app && bower install
cd .. && grunt build --no-color

sudo /etc/init.d/nginx reload
EOF

chmod +x /apps/bin/update.sh


cat <<EOF > /apps/bin/github-push-to-deploy.js
#!/usr/bin/env nodejs
var fs = require('fs'),
    proc = require('child_process');

var payload;
try {
    payload = JSON.parse(fs.readFileSync('/dev/stdin'));
} catch(err) {
    process.stdout.write('Status: 400\nContent-Type: text/plain\n\n' + err.toString() + '\n');
    process.exit(0);
}

if (!payload.ref || !payload.ref.match(/^refs\/heads\/master$/i)) {
    process.stdout.write('Status: 200\nContent-Type: text/plain\n\nSkip update: not master branch\n');
    process.exit(0);
}

proc.execFile('sudo', ['-u', 'apps', '/apps/bin/update.sh'], {}, function(err, stdout, stderr) {
    var resp = 'Status: ' + (err ? 500 : 200) + '\nContent-Type: text/plain\n\n';
    resp += '\n>>> STDOUT:\n' + stdout + '\n\n>>> STDERR:\n' + stderr;
    process.stdout.write(resp);
});
EOF

chmod +x /apps/bin/github-push-to-deploy.js


cat <<EOF > /etc/nginx/sites-enabled/default
server {
    root /apps;
    index index.html index.htm;

    server_name localhost;

    location / {
        root /apps/mmdl/web-front-end/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }

    location /github {
        gzip off;
        fastcgi_pass unix:/var/run/fcgiwrap.socket;
        fastcgi_param SCRIPT_FILENAME \$document_root/bin/github-push-to-deploy.js;
        include fastcgi_params;
    }
}
EOF

service nginx restart
sudo -u apps /apps/bin/update.sh
