// This is a test beacon to transmit stuff on fldigi

const XMLRpc = require('xmlrpc');

TRANSMIT_HYSTERESIS = 1000; // in ms
RECEIVE_RATE = 500;

class FLDigi {
  constructor(host = 'localhost', port = 7362) {
    this.Client = XMLRpc.createClient({
      host: host,
      port: port,
      path: '/',
    });

    this.receiveInterval = null;
  }

  startReceiveInterval() {
    this.receiveInterval = setInterval(() => {
      const getDataPromise = this.xmlRpcPromise('rx.get_data');
      getDataPromise.then((data) => {
        if (data.length > 0 ) {
          if (typeof(this.receive) === 'function') {
            this.receive(data.toString());
          }
        }
      });
    }, RECEIVE_RATE);
  }

  stopReceiveInterval() {
    if (typeof(this.receiveInterval) !== 'undefined') {
      clearInterval(this.receiveInterval);
    }
  }

  async xmlRpcPromise(method, args = []) {
    return new Promise((resolve, reject) => {
      this.Client.methodCall(method, args, (err, result) => {
        console.debug(method, args, err, result);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async mainTx() {
    const prom = await this.xmlRpcPromise('main.tx');
    this.stopReceiveInterval();
    return prom;
  }

  async mainRx() {
    const prom = await this.xmlRpcPromise('main.rx');
    this.startReceiveInterval();
    return prom;
  }

  async textAddTx(content) {
    return this.xmlRpcPromise('text.add_tx', [content]);
  }

  async txGetData() {
    return this.xmlRpcPromise('tx.get_data');
  }

  async getModems() {
    return this.xmlRpcPromise('modem.get_names');
  }

  async setModem(modem) {
    return this.xmlRpcPromise('modem.set_by_name', [modem]);
  }

  async setCarrier(carrier) {
    return this.xmlRpcPromise('modem.set_carrier', [carrier]);
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

  async transmit(content) {
    // TODO: implement a transmit buffer, and wait for a transmit window
    try {
      await this.mainTx();
      await this.textAddTx(content);
      await this.waitForTxComplete();
      await this.mainRx();

      // There are some modes that have a postamble
      // this needs to be configurable, or work with a transmit buffer.
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }
};

module.exports = FLDigi;
