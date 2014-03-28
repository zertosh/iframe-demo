(function() {
  /* jshint -W054 */
  var ENV = {};
  var sig = Math.floor(new Date().getTime()/Math.random());

  function getFnBody(str) {
    return str.match(/function[^{]+\{([\s\S]*)\}$/)[1];
  }
  function safeStringify(obj) {
    try { return JSON.stringify(obj); } catch(err) { return ''; }
  }
  function safeParse(str) {
    try { return JSON.parse(str); } catch(err) { return {}; }
  }

  function evalr(e, data, fnBody) {
    function ipost(message) {
      message.__sig = sig;
      e.source.postMessage( safeStringify(message), e.origin );
    }
    function findEl() {
      var iframes = document.getElementsByTagName('iframe');
      for (var i = iframes.length - 1; i >= 0; i--) {
        if (iframes[i].contentWindow === e.source) return iframes[i];
      }
      return null;
    }
    function done(value) {
      ipost({ method: 'done', id: data.id, value: value });
    }
    var callback = new Function('env', 'I', fnBody);
    var I = {
      _ipost: ipost,
      payload: data.payload,
      findEl: findEl,
      done: data.deferred ? done : null
    };
    callback.call(null, ENV, I);
  }
  function isAllowed(origin) {
    return /trusted/.test(origin);
  }
  function listener(e) {
    if (!isAllowed(e.origin)) return;
    var data = safeParse(e.data);
    if (data.method === 'eval') {
      evalr(e, data, getFnBody(data.callback));
    }
  }
  window.addEventListener('message', listener, true);

})();
