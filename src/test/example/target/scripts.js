(function () {
    'use strict';

    class HTTP {

        constructor( baseUrl ) {
            this.baseUrl = baseUrl;
        }

        get( url ) {
            return fetch( this.baseUrl + url )
                .then( response => response.json() )
        }
    }

    const http = new HTTP( "http://localhost:8081" );

    document.addEventListener( "DOMContentLoaded", async function ( e ) {
        console.log( http );
    } );

}());
