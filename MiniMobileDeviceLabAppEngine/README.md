appengine-endpoints-helloendpoints-java-maven
=============================================

A "hello world" application for Google Cloud Endpoints in Java.

- [App Engine][1]

- [Java][2]

- [Google Cloud Endpoints][3]
- [Google App Engine Maven plugin][4]


1. Update the value of `application` in `appengine-web.xml` to the app
   ID you have registered in the App Engine admin console and would
   like to use to host your instance of this sample.

1. Optional step: These sub steps are not required but you need to do
   this if you want to use auth protected API methods.

    1. Update the values in `src/main/java/com/google/web/devtools/mobiledevicelab/Constants.java`
       to reflect the respective client IDs you have registered in the
       [APIs Console][6].

    1. Update the value of `google.devrel.samples.helloendpoints.CLIENT_ID`
       in `src/main/webapp/base.js` to reflect the web client ID you have
       registered in the [APIs Console][4].

1. Run the application with `mvn appengine:devserver`, and ensure it's
   running by visiting your local server's address (by default
   [localhost:8080][5].)

1. Get the client library with

   $ mvn appengine:endpoints_get_client_lib

   It will generate a jar file named something like
   `helloworld-v1-1.18.0-rc-SNAPSHOT.jar` under the
   `target/endpoints-client-libs/<api-name>/target` directory of your
   project, as well as install the artifact into your local maven
   repository.

1. Deploy your application to Google App Engine with

   $ mvn appengine:update

[1]: https://developers.google.com/appengine
[2]: http://java.com/en/
[3]: https://developers.google.com/appengine/docs/java/endpoints/
[4]: https://developers.google.com/appengine/docs/java/tools/maven
[5]: https://localhost:8080/
[6]: https://console.developers.google.com/
