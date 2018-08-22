const assert = require('assert'),
  grpc = require('grpc');

describe('gRPC client', () => {
  const {Calculator} = grpc.load('./proto/math.proto').test;
  const client = new Calculator('localhost:1234', grpc.credentials.createInsecure());

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
      timer.unref();
      assert.ok(ticks > 0);
      done();
    });
  });
});