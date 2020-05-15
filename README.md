fldigi-node
===

Minimalistic node.js wrapper for [fldigi](http://www.w1hkj.com/)'s XML-RPC bindings.

Example
---

Assume fldigi is already running locally.

```javascript
const Fldigi = require('fldigi-node');
client = new Fldigi();

await client.setModem('CW');
await client.setCarrier(1500);

client.receive = function(content) {
  console.log('Received content from the world!', content);

  await client.transmit('Thanks, friendo!');

  console.log('Well, we did our part.');
}
```
