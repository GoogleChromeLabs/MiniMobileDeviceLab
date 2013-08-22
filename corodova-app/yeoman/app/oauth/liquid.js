/**
 * The Mobile Application Library is called 'liquid'
 * @fileOverview This file contains the base of attributes 'liquid'
 * <br />
 * It is broken down in the following structure (for now)
 * <br />
 * liquid.js (A Base file with App Name and few other values)
 *  /helper (Stores all helper methods attached to the Application)
 *  /model (Storing all models used in the Application)
 *    
 * Everything is developed by extending liquid.
 * 
 * Filename convention shall be:
 * liquid.<criteria>.<name>.js  (criteria can be 'helper' or 'model' etc.)
 * 
 * @author Abdullah Rubiyath
 * @author Hossain Khan
 * 
 * @copyright Liquid Labs Inc.
 * 
 */


/**
 * The Base class of the Liquid Library
 * 
 * @param window Takes the Window object of the DOM and attaches 
 *               global liquid variable to it.
 */
(/** @lends <global> */function(window) {
   
   /* check if the library was already included */	
   var _liquid = window.liquid;	
   
   /* if it already exists, then simply return */
   if (_liquid) {
	   return;
   }
   
   /* 
    * Create a global object and assign values to it.
    * @global
    * @name liquid
    */   
   var liquid = {
	
		/* the name of the App */
		appName: 'Device Lab',
		
		/**
		 * Configuration values needs to be declared below
		 */
		config: {
			
			debug: true,
			
			/**
			 * Configuration values for Google API (GAPI)
			 */
			 gapi : {
				
				endpoint: "https://accounts.google.com/o/oauth2/auth",
				endtoken: "https://accounts.google.com/o/oauth2/token", // token endpoint
				
				response_type: "code",

				// ## Update this value: The client_id obtained during application registration ##
				client_id: "148156526883-dou2l3q2b639ga4mlj10uuu4l4bnp631.apps.googleusercontent.com",
				
				// ## Update this value: The client secret obtained during application registration ##
				client_secret: "t0_C0IiVMEnK0MbOhWVMuKez", 		
				
				// or urn:ietf:wg:oauth:2.0:oob
				redirect_uri: "http://localhost", 				 

				// The URI registered with the application
				redirect_url_token: "", 						

				// @see https://developers.google.com/google-apps/tasks/auth
				scope: "https://www.googleapis.com/auth/tasks", 
				
				/* As defined in the OAuth 2.0 specification, this field must contain a value 
				 * of "authorization_code" or "refresh_token" */			
				grantTypes: { AUTHORIZE: "authorization_code", REFRESH: "refresh_token" }, 
				
				access_type: "offline",
				
				// ## Not required to be updated: only used for echoing ##
				state: "lligtaskinit"
			}		
		},
		
		
		/** 
		 * Empty helper and model which are extended later in other libraries 
		 */
		helper: {},	
		model: {},
			
		log: function(message) {
			
			/* if debug mode is true, then echo message */
			if (liquid.config.debug) {
				console.log(message);
			}
		}
   };
   
   
   /* now assign liquid to window object to make it globally accessible */
   window.liquid = liquid;
   
})(window);