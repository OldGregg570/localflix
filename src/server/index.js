'use strict';

var path = require('path'),
    logger = require('winston'),
    ffmpeg = require('fluent-ffmpeg'),
    fs = require('fs'),
    Async = require('async'),
    mkdirp = require('mkdirp');

module.exports = {
 shows: getShows
}

function getShows (req, res) {
 var mainShowsDir = 'D:/tv/videos';

 function getThumbnail (showDir, seasonDir, show) {
  var videoPath = path.join(mainShowsDir, showDir, seasonDir, show);
  var servedDir = 'D:/tv/src/public/',
      thumbnailFolder = path.join('thumbnails', showDir, seasonDir, show.split('.')[0]);

  console.log("SHOW: " + showDir + seasonDir + show);
  var options = {
    count: 1,
    timemarks: [ '10' ],
    folder: path.join(servedDir, thumbnailFolder)
  };

  return new Promise (function (resolve) {
   mkdirp (path.join (servedDir, 'thumbnails', showDir, seasonDir), function (err) {
     console.log ('MKDIR DONE');
     var fpath;
     ffmpeg(videoPath)
      .on('filenames', (filenames) => { fpath = path.join(thumbnailFolder, filenames[0]); })
      .on('end', (err) => { resolve ({ thumbnail: fpath, video: path.join ('videos', showDir, seasonDir, show)}); })
      .screenshots(options);
    });
   });
 }

 var promises = [];

 fs.readdir (mainShowsDir, readShowDirs);

 function readShowDirs (err, mainDir) {

  Async.forEachOf(mainDir, forEachShowDir, thenShow);

  function forEachShowDir (showDir, key, cbShow) {
   fs.readdir (path.join(mainShowsDir, showDir), function (err, season) {

    Async.forEachOf (season, forEachSeasonDir, thenSeason);

    function forEachSeasonDir (seasonDir, key, cbSeason) {
     fs.readdir (path.join(mainShowsDir, showDir, seasonDir), function (err, shows) {
      shows.forEach ((show) => {
       promises.push(getThumbnail(showDir, seasonDir, show));
      });
      cbSeason();       
     });
    }

    function thenSeason (e) {
     cbShow();
    }
   });
  }

  function thenShow (e) {
   Promise.all(promises).then(function (shows) {
    res.status(200).json(shows);
   });
  }
 }
}
