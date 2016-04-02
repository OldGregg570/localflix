'use strict';

let dirTree = require('directory-tree'),
    path = require('path'),
    logger = require('winston'),
    ffmpeg = require('fluent-ffmpeg'),
    fs = require('fs'),
    Async = require('async'),
    mkdirp = require('mkdirp'),
    config = require('../../config.json');

const EXTENSIONS = require('./extensions.js'),
      MAIN_SHOWS_DIR = config.main_shows_dir;


function isFile (c) { return c.type === 'file'; }
function isDir (c)  { return c.type === 'directory'; }

module.exports = {
 getTree: function (req, res) {
  let p = req.params.path ? req.params.path.replace('%2F', '/') : '',
      tree = dirTree.directoryTree(path.join(MAIN_SHOWS_DIR, p), EXTENSIONS),
      thumbnailPromises = [];


  tree.children.filter(isDir).forEach((dir) => {
   console.log(dir.path);
   thumbnailPromises.push(getThumbnails(dir));
  });

  function getThumbnails (dir) {
   return new Promise ((resolve) => {
    var promises = [];
    dir.children.filter(isDir).forEach((dir) => {
     thumbnailPromises.push(getThumbnails(dir));
    });

    dir.children.filter(isFile).forEach((file) => {
      promises.push(createThumbnail (file));
    });
    Promise.all(promises).then((thumbs) => {
     if (thumbs) {
      dir.thumbnail = thumbs[0];
     }
     resolve(thumbs);
    }).catch(console.error);;
   });
  }

  Promise.all(thumbnailPromises).then((thumbnails) => {
   thumbnails = thumbnails.reduce((e, s) => e.concat(s));
   tree.children.forEach((c, i) => {
    c.thumbnail = thumbnails[i];
   });
   res.status(200).json(tree);
  }).catch(console.error);


  function createThumbnail (show) {
   const SERVED_DIR = path.join(__dirname, '/../', 'public');
   var parsedPath = path.parse(show.path),
       thumbnailFolder = path.join('thumbnails', p, parsedPath.dir, parsedPath.base.split('.').join('')),
       options = { count: 1, timemarks: [ '10' ], folder: path.join(SERVED_DIR, thumbnailFolder) },
       videoPath = path.join(MAIN_SHOWS_DIR,  p, show.path);

   return new Promise (function (resolve) {
    mkdirp (path.join (SERVED_DIR, thumbnailFolder), function (err) {
      // fs.writeFile(SERVED_DIR + thumbnailFolder + 'tn.png', {}, function (err) {
      //  console.log(err);
      // });

      ffmpeg(videoPath)
         .on('filenames', (filenames) => {
          fpath = path.join(thumbnailFolder, filenames[0]);
          show.thumbnail = fpath;
         })
         .on('end', (err) => { resolve (fpath); })
         .screenshots(options);
    });
   });
  }
 }
}
