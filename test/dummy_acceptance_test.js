const FLDigi = require('../index.js');

(async function() {
  const digi = new FLDigi();

  digi.receive = function(content) {
    console.log('DATA', content);
  };

  await digi.setModem('CW');
  await digi.transmit('foobar');
  await digi.setCarrier(1500);
})();
