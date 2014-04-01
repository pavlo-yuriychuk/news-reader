news-reader
===========

News-reader node.js app
To run it type

~~~bash
npm start
~~~

Confirguration
--------------

Located in app/config.js
"port": 8080, // port where server is run
"logPath": "../log", // Path to logs folder relative to ./app
"dataPath": "../data", // Path to store jsons , relative to ./app
"feeds" // Array of feeds objects. Url, title, are self descriptive
