# GCE project setup

1. Node app is currently listening on port `3000`, so let's add it to the firewall using `gcutil` tool:

    <pre>gcutil --project=mmobdevlab addfirewall --allowed='tcp:3000' \
           --description='Allow incoming TCP 3000' allow-3000
    </pre>

2. Create a new GCE instance using the same `gcutil`:

	<pre>gcutil --project mmobdevlab addinstance mmdl \
           --automatic_restart --auto_delete_boot_disk=true --on_host_maintenance=migrate \
           --zone=europe-west1-b --machine_type=f1-micro \
           --image=projects/debian-cloud/global/images/backports-debian-7-wheezy-v20140415 \
           --metadata_from_file startup-script:gce/startup-script.sh
    </pre>

  You should be able to see something similar to this:

  <pre>
    Table of resources:
    +------+----------------+---------------+----------------+---------+
    | name | network-ip     | external-ip   | zone           | status  |
    +------+----------------+---------------+----------------+---------+
    | mmdl | 10.240.1.2     | 1.2.3.4       | europe-west1-b | RUNNING |
    +------+----------------+---------------+----------------+---------+
  </pre>

  Note `external-ip` value - we'll need it later.

3. Create a new CloudSQL instance. This time we'll use `gcloud` util. 
  Note that `authorized-networks` contains the `external-ip` of the GCE instance created earlier:

  <pre>gcloud --project mmobdevlab sql instances create mmdlsql \
           --tier D0 --region europe-west1 --gce-zone europe-west1-b \
           --activation-policy ALWAYS --assign-ip --authorized-networks 1.2.3.4
  </pre>

4. Set root password for the CloudSQL instance we've just created:

  <pre>
    gcloud --project mmobdevlab sql instances set-root-password mmdlsql \
           --password &lt;my-secret-password>
  </pre>

5. Get IP address of the CloudSQL instance. We'll need it later:

  <pre>
    gcloud --project mmobdevlab sql instances get mmdlsql
  </pre>

  You should be looking for `ipAddresses` section:

  <pre>
     ipAddresses:
       [
         ipAddress: 4.3.2.1
       ]
  </pre>

6. Almost done. Copy `config.sample.js` into `config.js` and update mysql settings

7. We're now ready to deploy the node app:

  <pre>
  grunt gce:deploy
  </pre>

  If you know the IP address of the GCE instance, you can add it to deploy command. This should speed up things a little:

  <pre>
  grunt gce:deploy:1.2.3.4
  </pre>

  You might notice an error at the end of the very first deployment:
  > error:   Error restarting process: /apps/mmdl-backend/app.js
  > error:   Cannot find forever process: /apps/mmdl-backend/app.js

  That's ok. We can start the app with the following:

  <pre>
  grunt gce:start
  </pre>

  The output should look like this:
  > info:    Forever processing file: /apps/mmdl-backend/app.js

  If you want to make sure the process is running, execute:

  <pre>
  grunt gce:ps
  </pre>

  The output will look like:

  <pre>
  info:    Forever processes running
  data:    uid      command         script                    forever pid  logfile                 uptime
  data:    [0] zz9Y /usr/bin/nodejs /apps/mmdl-backend/app.js 3372    3374 /root/.forever/zz9Y.log 0:0:0:24.657
  </pre>

  You can also check whether the app is accessible and responding correctly:

  <pre>
  curl 1.2.3.4:3000/version
  </pre>

## Other useful commands

If you ever wanted to connect to the CloudSQL instance from home or a work place, add [your ip address](https://www.google.com/#q=what's+my+ip) to `authorized-networks`:

<pre>
gcloud --project mmobdevlab sql instances patch mmdlsql \
       --authorized-networks 1.2.3.4 5.6.7.8/13
</pre>

where `1.2.3.4` if the GCE instance IP address, and `5.6.7.8/13` is another IP range you want to access the CloudSQL instance from.

It is now possible to connect to the instance with any mysql client:

<pre>
mysql -u root -h 4.3.2.1 -p 
</pre>


If you ever wanted to check out all of the GCE instance properties, you can do:

<pre>
gcutil --project mmobdevlab getinstance mmdl --zone europe-west1-b
</pre>

To delete GCE instance:

<pre>
gcutil --project mmobdevlab deleteinstance mmdl -f --zone europe-west1-b --delete_boot_pd
</pre>
