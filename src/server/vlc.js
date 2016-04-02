'use strict';

const spawn = require('child_process').spawn;
var http = require('http'),
    config = require('../../config.json'),
    path = require('path');

module.exports = function () {
 const vlc = spawn('vlc', ['--fullscreen' ] );

 vlc.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
 });

 vlc.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
 });

 function sendCommand (options) {
  options.host = 'localhost';
  options.port = 8080;
  options.auth = ':101232';

  return new Promise ((resolve) => {
   http.request(options, function (response) {
    let str = '';
    response.on('data', (chunk) => str += chunk);
    response.on('end', () => resolve(str) );
   }).end();
  });
 }

 return {
  enqueue: function (req, res) {
   //http://localhost:8080
  },
  play: function (req, res) {

   console.log(req.body.video);
   //  D:%5Ctv%5Cvideos%5Cshow%5Cseason%201%5Cjellyfish.mkv'
   var options = {
    path: `/requests/status.json?command=in_play&input=${encodeURIComponent(path.join (config.main_shows_dir, req.body.file))}`,
   };

   sendCommand(options).then(() => {
    options.path = '/requests/status.json?command=fullscreen';
    sendCommand(options).then(() => {
     res.status(200);
    });
   });
  },

  pause: function (req, res) {
   var options = { path: '/requests/status.json?command=in_pause', };
   sendCommand(options).then(() => { res.status(200); });
  }



 }
}
