#!/usr/bin/env node

require('daemon')();

var config = require('./config.json');
var _ = require('underscore');
var FeedParser = require('feedparser');
var request = require('request');

const POLLING_INTERVAL = 1*60*1000;

function fetch(url) {
	var req = request(url);
	var feedparser = new FeedParser();
	
	req.on('error', function (error) {
	  console.error(error);
	});

	req.on('response', function (res) {
	  var stream = this;
	  if (res.statusCode != 200) {
	  	console.error(res.text);
	  	return;
	  }
	  stream.pipe(feedparser);
	});

	feedparser.on('error', function(error) {
	  console.error(error);
	});

	feedparser.on('readable', function() {
	  var stream = this;
	  var meta = this.meta;
	  var item;

	  while (item = stream.read()) {
	    console.log(item);
	  }
	});
};

function fetchAllFeeds() {
	_.each(config.feeds, function (item) {
		fetch(item.url);
	});
};

var fetchTimer = setInterval(function () {
	fetchAllFeeds();
}, POLLING_INTERVAL);

process.on('SIGHUP', function () {
	if (fetchTimer) {
		killTimer(fetchTimer);
	};
});

process.on('SIGTERM', function () {
	if (fetchTimer) {
		killTimer(fetchTimer);
	};
});

// fetchAllFeeds();