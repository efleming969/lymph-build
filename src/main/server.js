const FS = require( "fs" )
const URL = require( "url" )
const Path = require( "path" )
const HTTP = require( "http" )

const Bundler = require( "./bundler" )

const reloadScriptBlock = `<script>
    console.log("listening for reload")
    const source = new EventSource("http://localhost:5000")

    source.onmessage = function (){
        source.close()
        location.reload() 
    }
</script>`

const serverSentHeaders = {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*"
}

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
    return Object.assign( all, ...exts.map( ext => ({ [ ext ]: type }) ) )
}, {} )

const cwd = process.cwd()
const sourceDirectory = Path.join( cwd, process.argv[ 2 ] || "src" )
const distDirectory = Path.join( cwd, process.argv[ 3 ] || "dist" )
const port = process.argv[ 4 ] || 8080

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
    res.write( reloadScriptBlock, "utf8" )
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

const sendMessage = function ( res, channel, data ) {
    res.write( `event: ${ channel }\nid: 0\ndata: ${ data }\n` )
    res.write( "\n\n" )
}

const reloadServer = HTTP.createServer( function ( request, res ) {
    res.writeHead( 200, serverSentHeaders )

    sendMessage( res, "connected", "awaiting change" )

    setInterval( sendMessage, 60000, res, "ping", "still waiting" )

    FS.watch( distDirectory, { recursive: true }, function () {
        return sendMessage( res, "message", "reloading page" )
    } )
} )

reloadServer.listen( 5000 )

const staticServer = HTTP.createServer( function ( req, res ) {
    const decodedPathName = decodeURI( URL.parse( req.url ).pathname )
    const extension = decodedPathName.replace( /^.*[\.\/\\]/, "" ).toLowerCase()
    const uri = Path.join( distDirectory, decodedPathName )

    console.log( "requested", decodedPathName )

    if ( extension === "html" ) {
        FS.readFile( uri, "utf8", function ( error, template ) {
            if ( error ) sendErrorHtml( res, error )
            else sendHtml( res, template )
        } )
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

const bundler = new Bundler()

console.log( "watching", sourceDirectory )

FS.watch( sourceDirectory, { recursive: true }, async function () {
    await bundler.build( sourceDirectory, distDirectory )
} )

console.log( `Serving on http://localhost:${ port }` )