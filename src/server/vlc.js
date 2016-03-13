const spawn = require('child_process').spawn;

module.exports = {
 play: function (req, res) {
  const vlc = spawn('C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe', ['--fullscreen', req.body.file  ] );

  vlc.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  vlc.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  vlc.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  res.status(200);
 }
}
