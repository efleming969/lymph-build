console.log( "hello, world" )

const createOptions = function ( method, data, token ) {
    const headers = {
        "content-type": "application/json",
        "accept": "application/json",
        "credentials": "include"
    }

    if ( token ) {
        headers[ "Authorization" ] = `Bearer ${ token }`
    }

    const body = data ? JSON.stringify( data ) : null

    return { method, headers, body }
}

document.getElementById( "set-data" ).addEventListener( "click", function ( e ) {
    const options = createOptions( "POST", { name: "foo" } )

    fetch( "http://api.acme.localhost:8080/erick/sessions", options )
        .then( x => x.json() )
        .then( function ( data ) {
            console.log( data )
        } )
} )

document.getElementById( "get-data" ).addEventListener( "click", function ( e ) {
    const options = createOptions( "GET" )

    fetch( "http://api.acme.localhost:8080/erick/sessions", options )
        .then( x => x.json() )
        .then( function ( data ) {
            console.log( data )
        } )
} )
