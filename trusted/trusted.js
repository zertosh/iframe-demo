/* jshint jquery: true */
var IX = (function() {
  var deferreds = {};
  var ready = $.Deferred();
  var verified = false;
  var sig;
  function listener(e) {
    var data = safeParse(e.data);
    if (!verified) {
      if (data.method === 'ready') {
        sig = data.__sig;
        verified = true;
        ready.resolve(IX);
      }
      return;
    }
    if (data.__sig !== sig) return;
    if (data.method === 'done') {
      var dfd = deferreds[data.id];
      delete deferreds[data.id];
      dfd.resolve(data.value);
    }
  }
  function defer(fn, payload) {
    var id = genId();
    ppost({
      method: 'eval',
      callback: fn.toString(),
      payload: payload,
      deferred: true,
      id: id
    });
    return (deferreds[id] = $.Deferred());
  }
  function fcall(fn, payload) {
    ppost({
      method: 'eval',
      callback: fn.toString(),
      payload: payload
    });
  }
  function safeStringify(obj) {
    try { return JSON.stringify(obj); } catch(err) { return ''; }
  }
  function safeParse(str) {
    try { return JSON.parse(str); } catch(err) { return {}; }
  }
  function ppost(message) {
    window.parent.postMessage(safeStringify(message), '*');
  }
  function genId() {
    return Math.floor( Date.now()/Math.random() );
  }

  // Setup
  window.addEventListener('message', listener, true);
  fcall(function(env, I) {
    I._ipost({ method: 'ready' });
  });

  return {
    ready: ready.promise(),
    defer: defer,
    fcall: fcall
  };
})();
