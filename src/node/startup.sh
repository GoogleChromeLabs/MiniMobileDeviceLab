# npm install

# Copy over android rules.
sudo cp ~/MiniMobileDeviceLab/misc/51-android.rules /etc/udev/rules.d/51-android.rules
sudo chmod 644   /etc/udev/rules.d/51-android.rules
sudo chown root. /etc/udev/rules.d/51-android.rules
sudo service udev restart

node ./bin.js --config ~/demo/config.json --service-account ~/demo/service-account-key.json
