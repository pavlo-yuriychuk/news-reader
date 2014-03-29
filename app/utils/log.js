/**
 * Created by pavlo on 29.03.14.
 */
var winston = require('winston');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = {
    getInstance: function (name, logPath) {
        if (logPath) {
            mkdirp(logPath, function (err) {
                console.log(err);
            });
        } else {
            logPath = __dirname;
        }
        return new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({ json: false, timestamp: true }),
                new winston.transports.File({ filename: path.join(logPath,  name + '-debug.log'), json: false })
            ],
            exceptionHandlers: [
                new (winston.transports.Console)({ json: false, timestamp: true }),
                new winston.transports.File({ filename: path.join(logPath, name + 'exceptions.log'), json: false })
            ],
            exitOnError: false
        });
    }
};