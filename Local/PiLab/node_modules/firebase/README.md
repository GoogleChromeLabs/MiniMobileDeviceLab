# Firebase

## Changelog

This package's changelog can be found here: https://www.firebase.com/docs/web/changelog.html

## Overview

[Firebase](https://www.firebase.com/) provides three key services that enable you to build rich, full-featured applications using just client-side code:

0. **A realtime data API.** Our API replaces the need for most backend databases and server code by handling the heavy lifting of data storage and synchronization.

0. **User management and authentication.** Our Simple Login service handles your user management and authentication needs out-of-the-box. Or, if you prefer to manage users yourself, you can maintain complete control using Custom Login.

0. **Hosting.** With hosting, you can deploy your static website to the internet with a single command.

All of these services are built for security, reliability, and scale, so you can deploy your applications with confidence.

## Node.js & Firebase

While you can write entire Firebase applications without any backend code, many developers will still want to run their own servers. For these developers, we provide a full-featured Node.js module. This library has the same Javascript API and features as our web client.

To get started, install Firebase using npm:

    npm install firebase

Now, just require the library in your application and start using your data:

    var Firebase = require('firebase');
    var myRootRef = new Firebase('https://myprojectname.firebaseIO-demo.com/');
    myRootRef.set("hello world!");

## Next Steps

If you haven't already done so, you should try our [tutorial](https://www.firebase.com/tutorial/index.html#gettingstarted). Next, we recommend checking out our [example apps](https://www.firebase.com/docs/examples.html) or reading on in the [docs](https://www.firebase.com/docs/).



