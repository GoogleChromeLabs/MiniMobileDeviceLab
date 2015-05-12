Mini Mobile Device Lab
======================

# Steps to Get Going

1. Copy config.sample.json to config.json.
2. Fill in the attributes of config.json accordingly.
    1. 'firebaseUrl' is the URL for your firebase project.
    2. 'firebaseKey' is the api key for that firebase project.
    3. 'frontEndUrl' is the URL for where you've hosted PiLabFrontEnd.
3. Run the server somewhere with 'node server.js'.
4. Run the client on the Pi or computer connected to the hub with the devices with 'node client.js'.
5. Visit the PiLabFrontEnd to control everything.


# Auto Starting the PiLab

1. Clone the repo to your Pi
1. Add `./login.sh` to the end of your local `.profile`
1. Create `./login.sh` and add the following code:
```
cd ~/MiniMobDevLab
echo Starting PiLab in 5 seconds
sleep 5
./client.sh
```
1. Run `chmod +x login.sh` 

You may want to change `client.sh` to `server.sh` depending on your config.
