'use strict';

const spawn = require('child_process').spawn;
var http = require('http');

module.exports = function () {
 const vlc = spawn('vlc', ['--fullscreen' ] );

 vlc.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
 });

 vlc.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
 });

 function sendCommand (options) {
  options.host = '192.169.0.5';
  options.port = 8080;
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
   var options = {
    path: '/requests/status.json?command=in_play&input=D:%5Ctv%5Cvideos%5Cshow%5Cseason%201%5Cjellyfish.mkv',
   };

   sendCommand(options).then(() => {
    console.log(res);
    options.path = '/requests/status.json?command=fullscreen';
    sendCommand(options).then(console.log);
   });

   res.status(200);
  }
 }
}
