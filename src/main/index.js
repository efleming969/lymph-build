const Path = require( "path" )
const FS = require( "fs" )
const HTTP = require( "http" )
const URL = require( "url" )
const Browserify = require( "browserify" )

const types = {
    "application/javascript": [ "js", "mjs" ],
    "application/json": [ "json", "map" ],
    "image/jpeg": [ "jpeg", "jpg", "jpe" ],
    "image/png": [ "png" ],
    "image/x-icon": [ "ico" ],
    "text/css": [ "css" ],
    "text/html": [ "html", "htm" ]
}

const mime = Object.entries( types ).reduce( function ( all, [ type, exts ] ) {
    return Object.assign( all, ...exts.map( ext => ( { [ ext ]: type } ) ) )
}, {} )

const sendError = function ( res, status ) {
    res.writeHead( status )
    res.end()
}

const sendErrorHtml = function ( res, error ) {
    sendHtml( res, `<!doctype html>
    <html lang="en">
        <head>
            <meta charset="utf-8"/>
        </head>
        <body>
            <h1>Error</h1>
            <p>${ error.message }</p>
        </body>
    </html>` )
}

const sendHtml = function ( res, html ) {
    res.writeHead( 200, {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*"
    } )

    res.write( html, "utf8" )
    res.end()
}

const sendFile = function ( res, status, file, ext ) {
    res.writeHead( status, {
        "Content-Type": mime[ ext ] || "application/octet-stream",
        "Access-Control-Allow-Origin": "*"
    } )

    res.write( file, "binary" )
    res.end()
}

const sendJavaScript = function( res, uri ) {
    const browserify = Browserify( { debug: true, standalone: "app" } )
    const index_script = Path.join( "src/main", uri )

    console.log( `bundling index script: ${ index_script }` )

    browserify.external( [] )
    browserify.add( index_script )

    browserify.bundle( function ( error, buffer ) {

        if ( error ) {
            res.writeHead( 500 )
        }
        else {
            res.writeHead( 200, {
                "Content-Type": "application/javascript",
                "Access-Control-Allow-Origin": "*"
            } )

            res.write( buffer, "binary" )
        }

        res.end()
    } )
}

const start = function( configuration ) {

    const cwd = process.cwd()
    const sourceDirectory = Path.join( cwd, configuration.src || "src/main" )
    const port = configuration.port || 8080

    console.log( `sourceDirectory: ${ sourceDirectory }` )

    const staticServer = HTTP.createServer( function ( req, res ) {
        const decodedPathName = decodeURI( URL.parse( req.url ).pathname )
        const extension = decodedPathName.replace( /^.*[\.\/\\]/, "" ).toLowerCase()
        const uri = Path.join( sourceDirectory, decodedPathName )
        const urlString = `http://${ req.headers.host }${ decodedPathName }`
        const url = URL.parse( urlString )

        console.log( `handling: ${ uri }` )

        if ( extension === "html" ) {
            FS.readFile( uri, "utf8", function ( error, template ) {
                if ( error ) sendErrorHtml( res, error )
                else sendHtml( res, template )
            } )
        } else if ( extension === "js" ) {
            sendJavaScript( res, decodedPathName )
        } else {
            FS.stat( uri, function ( error ) {
                if ( error ) return sendError( res, 404 )

                FS.readFile( uri, "binary", function ( error, file ) {
                    if ( error ) return sendError( res, 500 )

                    sendFile( res, 200, file, extension )
                } )
            } )
        }

    } )

    staticServer.listen( parseInt( port, 10 ) )

    console.log( `Serving @ http://localhost:${ port }` )
}

module.exports = { start }
