let count = 0;

function noop() { }

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object} optional options
 * @param {Function} optional callback
 */

function jsonp(url, opts = {}, fn) {
    const prefix = opts.prefix || '__jp';

    const id = opts.name || (prefix + count++);

    const jsonpCallback = opts.jsonpCallback || 'callback';
    const timeout = opts.timeout || 60000;
    const target = document.head;
    const script = document.createElement('script');
    let timer;

    if (timeout) {
        timer = setTimeout(() => {
            cleanup();
            if (fn) {
                fn(new Error('Timeout'));
            }
        }, timeout);
    }

    function cleanup() {
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }

        window[id] = noop;

        if (timer) {
            clearTimeout(timer);
        }
    }

    function cancel() {
        if (window[id]) {
            cleanup();
        }
    }

    window[id] = function (data) {
        cleanup();
        if (fn) {
            fn(null, data);
        }

    };
    // eslint-disable-next-line
    url += (~url.indexOf('?') ? '&' : '?') + jsonpCallback + '=' + encodeURIComponent(id);
    url = url.replace('?&', '?');

    script.src = url;
    target.appendChild(script);

    return cancel;
}

export { jsonp };
