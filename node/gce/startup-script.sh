#!/bin/bash

# Install NodeJS, Git and MySQL client
apt-get update && apt-get install -y nodejs git mysql-client
# Many scripts use /usr/bin/node
ln -s /usr/bin/nodejs /usr/bin/node

# Instasll npm as it isn't included in the nodejs package
curl http://registry.npmjs.org/npm/-/npm-1.4.7.tgz | tar xzf -
cd package
node cli.js install -g -f

# Install long-running processes support
npm install -g forever

# Prepare empty dir for the backend app
mkdir -p /apps/mmdl-backend
