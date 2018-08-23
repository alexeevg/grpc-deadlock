const assert = require('assert'),
  grpc = require('grpc');

describe('gRPC client', () => {
  const {Calculator} = grpc.load('./proto/math.proto').test;

  function runTestsWith(serverAddress) {
    describe(`client requesting ${serverAddress}`, () => {
      const client = new Calculator(serverAddress, grpc.credentials.createInsecure());

      it('should not hang when server is down', done => {
        client.add({a: 1, b: 2}, (err) => {
          if (!err) {
            assert.fail('Expected connection error');
          }
          done();
        });
      });

      it('should not block event loop when server is down', done => {
        let ticks = 0;
        const timer = setInterval(() => {
          console.log('tick', ticks);
          ++ticks;
        }, 100);
        client.add({a: 1, b: 2}, () => {
          clearInterval(timer);
          assert.ok(ticks > 0);
          done();
        });
      });
    });
  }

  runTestsWith('127.0.0.1:1234');   // ok
  runTestsWith('[::1]:1234');       // hangs
  runTestsWith('localhost:1234');   // hangs if localhost resolves to ::1
});