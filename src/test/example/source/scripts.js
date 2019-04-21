import * as Foo from "./scripts/foo.js"
import * as Bar from "./scripts/bar.js"

document.addEventListener( "DOMContentLoaded", async function ( e ) {
    console.log( Foo.create(), Bar.create() )
} )
