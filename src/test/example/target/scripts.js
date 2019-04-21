(function () {
    'use strict';

    const create = function () {
        return "foo"
    };

    const create$1 = function () {
        return "bar"
    };

    document.addEventListener( "DOMContentLoaded", async function ( e ) {
        console.log( create(), create$1() );
    } );

}());
