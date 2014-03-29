require('daemon')();
var http = require("http");
var Handlebars = require("handlebars");
var path = require("path");
var config = require("./config.json");
var fs = require("fs");
var Q = require("q");
var Logger = require('./utils/log');
var _ = require("underscore");

var readFile = Q.denodeify(fs.readFile);

var logger = Logger.getInstance("feed-server", config.logPath);

var App = {};
App.init = function () {
    logger.info("Loading template");
    var filePath = path.join(__dirname , 'views', 'main.hbs');
    return readFile(filePath, 'utf-8');
};

App.fetch = function () {
    logger.info("Loading data");
    return Q.all(_.map(config.feeds, function (item) {
        return readFile(path.join(config.dataPath, item.name + ".json"), "utf-8");
    }));
};

App.run = function (template) {
    logger.info("Loaded template");
    App.template = Handlebars.compile(template);
    App.server = http.createServer(function(request, response) {
        App.fetch().then(function (data) {
            logger.info("Loaded data");
            var feed = {
                title: "Newsfeed reader"
            };
            feed.feeds = _.map(data, function (item, index) {
                return {
                    title: config.feeds[index].title,
                    posts: JSON.parse(item)
                };
            });
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(App.template(feed));
            response.end();
        });
    }).listen(config.port);
};

logger.info("Started server with PID:" + process.pid);
process.on('SIGHUP', function () {
    logger.debug("Caught SIGHUP");
    App.server.close();
    process.exit();
});

process.on('SIGTERM', function () {
    logger.debug("Caught SIGTERM");
    App.server.close();
    process.exit();
});

App.init().then(App.run);

