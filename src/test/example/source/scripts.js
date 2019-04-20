import * as Utils from "./utils/index.js"

const http = new Utils.HTTP( "http://localhost:8081" )

document.addEventListener( "DOMContentLoaded", async function ( e ) {
    console.log( http )
} )
