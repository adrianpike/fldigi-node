const FLDigi = require('../index.js');

/* This is paired with ping_repeat.js for a simple way of testing out modes
and rigs. */

// {modem, carrier}

PING_TIME = 5000; // 5 seconds
HEADER = 'fldigi-node:';
FOOTER = ':end';

(async function() {
  let serial = 0;
  const digi = new FLDigi();

  digi.receive = function(content) {
    console.log(`Response: ${content}`);
    // TODO: checksum for valid results?
  };

  await digi.setModem('CW');
  await digi.setCarrier(1500);

  function transmit() {
    const transmission = `${HEADER}${serial}${FOOTER}`;
    console.log(`Sending: ${transmission}`);
    digi.transmit(transmission).then(function() {
      serial += 1;
      setTimeout(transmit, PING_TIME);
    });
  }

  transmit();

})();
