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
    sudo /home/pi/adb start-server
    sudo -u pi forever start $PILAB/client.js -l /home/pi/.pilab/output.log
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