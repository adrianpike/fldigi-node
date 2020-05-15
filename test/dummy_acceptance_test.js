const FLDigi = require('../index.js');

(async function() {
  const digi = new FLDigi();
  await digi.transmit('foobar');
})();
