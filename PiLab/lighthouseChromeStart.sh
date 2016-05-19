export LIGHTHOUSE_CHROMIUM_PATH=$(which google-chrome-unstable);

while :
do
  ./node_modules/lighthouse/scripts/launch-chrome.sh

  echo "Press [CTRL+C] to stop.."
	sleep 2
done
