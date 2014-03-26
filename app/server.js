var http = require("http");
var Handlebars = require("handlebars");
var path = require("path");
var fs = require("fs");
var Q = require("q");

var config = require("./config.json");
var App = {};

App.init = function (config) {
    var deferred = Q.defer();
    this.config = config;
    var filePath = path.join(__dirname + '/views/main.hbs');
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        var template;
        if (!err) {
            try {
                template = Handlebars.compile(data);
            } catch (e) {
                deferred.reject(e);
                return;
            }
            this.htmlTemplate = template;
            deferred.resolve(this);
        } else {
            deferred.reject(err);
        }
    }.bind(this));
    return deferred.promise;
};

App.run = function () {
    http.createServer(function(request, response) {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(this.htmlTemplate(data));
        response.end();
    }.bind(this)).listen(this.config.port);
};

App.init(config).then(App.run);