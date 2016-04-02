'use strict';

let express = require('express'),
    path = require('path'),
    logger = require('winston'),
    app = express (),
    ffmpeg = require('fluent-ffmpeg'),
    fs = require('fs'),
    Async = require('async'),
    parser = require('body-parser'),
    vlc = require('./server/vlc.js')(),
    index = require('./server/index.js');

app.use(parser.json());

app.use(express.static(__dirname + '/../bower_components'));
app.use(express.static(__dirname + '/public'));

function serveHtml(file_path) {
    return function (req, res) {
        res.sendFile(path.resolve(__dirname + file_path));
    };
}

app.get('/home', serveHtml('/public/index.html'));

app.post('/vlc/play', vlc.play);
app.post('/vlc/pause', vlc.pause);

app.get('/tree/:path?/', index.getTree);

let port = 8000;
logger.info (`Starting TV server on port ${port}`);
app.listen(8000);
