// This is a test beacon to transmit stuff on fldigi

const XMLRpc = require('xmlrpc');

TRANSMIT_HYSTERESIS = 1000; // in ms

class FLDigi {
  constructor(host = 'localhost', port = 7362) {
    this.Client = XMLRpc.createClient({
      host: host,
      port: port,
      path: '/',
    });
  }

  async xmlRpcPromise(method, args = []) {
    return new Promise((resolve, reject) => {
      this.Client.methodCall(method, args, (err, result) => {
        console.debug(method, err, result);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async mainTx() {
    return this.xmlRpcPromise('main.tx');
  }

  async mainRx() {
    return this.xmlRpcPromise('main.rx');
  }

  async textAddTx(content) {
    return this.xmlRpcPromise('text.add_tx', [content]);
  }

  async txGetData() {
    return this.xmlRpcPromise('tx.get_data');
  }

  async waitForTxComplete() {
    return new Promise((resolve, reject) => {
      const bytesTransmitted = (cb) => {
        this.Client.methodCall('tx.get_data', [], function(err, lastData) {
          cb(null, lastData.length);
        });
      };

      const checkForData = () => {
        bytesTransmitted(function(err, bytes) {
          console.debug(bytes, 'bytes transmitted since last check');
          if (bytes > 0) {
            setTimeout(checkForData, TRANSMIT_HYSTERESIS);
          } else {
            resolve();
          }
        });
      };

      // Let's always give it some time.
      setTimeout(checkForData, TRANSMIT_HYSTERESIS);
    });
  }

  receiveRaw(bytes) {
  }

  async transmit(content) {
    // TODO: implement a transmit buffer, and wait for a transmit window

    try {
      await this.textAddTx(content);
      await this.mainTx();
      await this.waitForTxComplete();
      await this.mainRx();
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }
};


module.exports = FLDigi;
