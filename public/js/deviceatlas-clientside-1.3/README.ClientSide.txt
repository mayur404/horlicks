# DeviceAtlas Client-side Component #

The DeviceAtlas APIs can work in conjunction with a JavaScript property 
detection file and merge the resulting properties for use on the server side. 
The client properties are also available to other JavaScript libraries. The 
DeviceAtlas client detection file needs to be included on your web page for this 
to function.


### Client-side Access to Properties ###
The properties gathered from the DeviceAtlas JavaScript detection are available
to other JavaScript functions and can be accessed on the client-side by using 
the "DeviceAtlas" namespace.

**Example:**
```JavaScript
// Does the browser support Web GL ?
var supportsWebGl = DeviceAtlas.js.webGl;
```

The normal DeviceAtlas property name should be used to access the client-side
property.


### Server Side Access to Properties ###
The JavaScript  detection file creates a special cookie with the detected client 
properties. The usage is different in the Enterprise and Cloud APIs.

* Use with Enterprise APIs *

If the cookie is available and the DeviceApiWeb extension is used, the API will
automatically use the cookie contents as a part of the detection. However it is
also possible to pass the client-side properties manually to the APIs.

** Apache / NGINX / IIS web server modules handle the cookie automatically. **

* Use with Cloud APIs *

If the cookie is available and the API is configured to use the cookie, the 
API will automatically forward the cookie contents to the Cloud service and 
will be used as a part of the detection.

For further information about usage of the Enterprise and Cloud APIs please,
refer to their documentation.

The client-side properties override any data file properties and also serve as 
an input into additional logic to determine other properties such iPhone models 
which are normally not detectable.

The cookie containing the properties is called "DAPROPS".


### Basic Server Side Usage ### 
1. Include the deviceatlas-X.X.min.js file on your web page.
2. In your web application, pass the contents of the DeviceAtlas cookie
   to the DeviceAtlas API.

NOTE: the cookie contents will only be set after the first request. It is
recommended to not rely on the client-side properties for the very first page.

Please see the Example code bundled with the API for more information.


### Custom Configuration ###
To customize a cookie name or other cookie parameters like a domain or a path
you can use the code below - just remember that this code must be used before
you include deviceatlas-X.X.min.js file.

```JavaScript
var DeviceAtlas = {
    cookieName: 'DAPROPS',           // the cookie name
    cookieExpiryDays: 1,             // the time the cookie expires in days
    cookieDomain: '.yourdomain.tld', // custom domain
    cookiePath: '/'                  // custom path
}
```


### Sending client-side data via URL ###
In a restricted environment where cookies are not allowed it is possible
to get the client-side data using the JavaScript getPropertiesAsString() method
and pass it as a URL parameter.

NOTE: When integrating with a web application, the value should be fetched from
the URL and passed to the DeviceAtlas API properly.

**Example:**
```JavaScript
<script type="text/JavaScript">

window.onload = function() {
    var img = document.createElement('img');
    img.setAttribute('id', 'ad-banner');
    img.setAttribute('src', './ads.php?DAPROPS=' +
        encodeURIComponent(DeviceAtlas.getPropertiesAsString()));
    document.body.appendChild(img);
}
        
</script>
```


### Adding device properties ###
You can extend and customize capabilities of Client-side component by adding or 
replacing functions to detect device properties.

It is as simple as calling DeviceAtlas.setProperty() function with the property 
name to set and function to get value with.

**Example:**
```JavaScript

<script type="text/javascript">

/**
 * Adding two new properties:
 * 
 *  js.batteryLevel: Battery level represented by a number from 0.0 to 1.0.
 *  js.batteryCharging: Boolean value to indicate whether the battery is 
 *  charging or not.
 *
 * For more details: http://www.w3.org/TR/battery-status
 */
var DeviceAtlas = {
    properties: {
        'js.batteryLevel': function() {
            return (DeviceAtlas.js.battery)?
            DeviceAtlas.getBattery().level:null;
        },
        'js.batteryCharging': function() {
            return (DeviceAtlas.js.battery)?
            DeviceAtlas.getBattery().charging:null;
        }
    }
}

</script>

<script type="text/javascript" src="./deviceatlas-X.X.min.js"></script>

```


- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

_ Copyright (c) 2008-2015 by Afilias Technologies Limited (dotMobi). All rights reserved. https://deviceatlas.com _
