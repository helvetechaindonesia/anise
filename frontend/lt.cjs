const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5174 });
    console.log('TERBENTUK! URL PUBLIK ANDA ADALAH:');
    console.log(tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel ditutup.');
    });
  } catch (err) {
    console.error('Error:', err);
  }
})();
