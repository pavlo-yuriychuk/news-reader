#!/usr/bin/env node

require('daemon')();

var config = require('./config.json');
var _ = require('underscore');
var FeedParser = require('feedparser');
var request = require('request');
var jf = require('jsonfile');
var Logger = require('./utils/log');
var mkdirp = require('mkdirp');
var path = require('path');

var logger = Logger.getInstance("feed-daemon", config.logPath);

const POLLING_INTERVAL = 1*60*1000;

function fetch(feedItem) {
    var req = request(feedItem.url);
	var feedparser = new FeedParser();
    var items = [];

	req.on('error', function (error) {
      logger.error(error);
	});

	req.on('response', function (res) {
	  var stream = this;
	  if (res.statusCode != 200) {
        logger.error(res.text);
	  	return;
	  }
	  stream.pipe(feedparser);
	});

	feedparser.on('error', function(error) {
	  logger.error(error);
	});
    feedparser.on('readable', function() {
	  var stream = this;
	  var meta = this.meta;
	  var item;

	  while (item = stream.read()) {
          if (item) {
              items.push(_.pick(item, "title", "summary", "guid", "description", "author", "pubDate", "image"));
          };
	  };
	});

    mkdirp(config.dataPath, function (err) {
        logger.error(err);
    });

    feedparser.on('end', function () {
        jf.writeFile(path.join(config.dataPath, feedItem.name + ".json"), items, function (err) {
            logger.error(err);
        });
    });
};

function fetchAllFeeds() {
	_.each(config.feeds, function (item) {
		fetch(item);
	});
};



var fetchTimer = setInterval(function () {
    fetchAllFeeds();
}, POLLING_INTERVAL);

process.on('SIGHUP', function () {
    logger.debug("Caught SIGHUP");
    if (fetchTimer) {
        clearInterval(fetchTimer);
    };
    process.exit();
});

process.on('SIGTERM', function () {
    logger.debug("Caught SIGTERM");
    if (fetchTimer) {
        clearInterval(fetchTimer);
    };
    process.exit();
});
fetchAllFeeds();
logger.info("Started daemon with PID:" + process.pid);