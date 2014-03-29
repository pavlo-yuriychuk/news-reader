#!/usr/bin/env node

/**
 * Created by pavlo on 26.03.14.
 */
var server = require("./app/server");
var FeedDaemon = require("./app/daemon");

require('daemon')();

FeedDaemon.start();
server.start();

process.on('SIGHUP', function () {
    logger.debug("Caught SIGHUP");
    FeedDaemon.stop();
    server.stop();
    process.exit();
});

process.on('SIGTERM', function () {
    logger.debug("Caught SIGTERM");
    FeedDaemon.stop();
    server.stop();
    process.exit();
});