var ScriptsShared = (function (exports) {
    'use strict';

    const sayHello = function () {
        console.log( "hello, world" );
    };

    exports.sayHello = sayHello;

    return exports;

}({}));
