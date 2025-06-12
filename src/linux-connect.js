const execFile = require('child_process').execFile;
const env = require('./env');

function connectToWifi(config, ap, callback) {
  console.log('Connecting to WiFi...');
  // New connection method
  const addArgs = [
    'connection',
    'add',
    'type',
    'wifi',
    'con-name',
    ap.ssid,
    'ssid',
    ap.ssid,
    'wifi-sec.key-mgmt',
    'wpa-psk',
    'wifi-sec.psk',
    ap.password
  ];

  // Add BSSID if available
  if (ap.bssid) {
    addArgs.push('wifi.bssid');
    addArgs.push(ap.bssid);
  }

  // Add interface if specified
  if (config.iface) {
    addArgs.push('ifname');
    addArgs.push(config.iface);
  }

  execFile('nmcli', ['connection', 'delete', ap.ssid], { env }, (delErr, delResp) => {
    // First create the connection profile
    execFile('nmcli', addArgs, { env }, (err, resp) => {
      if (err || resp.includes('Error: ')) {
        const error = err || new Error(resp.replace('Error: ', ''));
        callback && callback(error);
        return;
      }

        // Then activate the connection
        const upArgs = [
          'connection',
          'up',
          ap.ssid
        ];

        execFile('nmcli', upArgs, { env }, (err, resp) => {
          if (err || resp.includes('Error: ')) {
            const error = err || new Error(resp.replace('Error: ', ''));
            callback && callback(error);
            return;
          }
          callback && callback(null);
        });
      });
  });
  

}

module.exports = config => {
  return (ap, callback) => {
    if (callback) {
      connectToWifi(config, ap, callback);
    } else {
      return new Promise((resolve, reject) => {
        connectToWifi(config, ap, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  };
};
