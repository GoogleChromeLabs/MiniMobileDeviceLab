### BEGIN INIT INFO
# Provides:          pilab-startup
# Required-Start:    $remote_fs $named $syslog
# Required-Stop:     $remote_fs $named $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start PiLab at boot time
# Description:       Start PiLab at boot time.
### END INIT INFO

#!/bin/bash

PATH=$PATH:/sbin:/usr/sbin:/bin:/usr/bin:/usr/local/bin
PILAB=/home/pi/MiniMobileDeviceLab/PiLab

case "$1" in
  start)
    cd /home/pi/MiniMobileDeviceLab/
    
    current_commit=$(git rev-list HEAD --max-count=1 | cut -c1-7)
    echo ""
    echo Current commit ${current_commit}
    echo "${current_commit}" > version.txt

    cd PiLab

    echo ""
    echo Starting ADB Server with sudo
    sudo /home/pi/adb start-server

    echo ""
    echo Installing and updating node modules
    npm install

    sudo -u pi forever start -a -l /home/pi/MiniMobileDeviceLab/output.log $PILAB/client.js
    ;;
  stop)
    sudo -u pi forever stop $PILAB/client.js
    ;;
  *)

  echo "Usage: /etc/init.d/pilab-startup {start|stop}"
  exit 1
  ;;
esac
exit 0