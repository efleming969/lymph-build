var HTTP = require( "http" )
var Express = require( "express" )
var Request = require( 'request' )

var Bundler = require( "./index" )

var app = Express()

app.get( "/", function( req, res ) { res.send( 'hello' ) } )
app.get( "/index.js", Bundler( "./index.js" ) )

var server = HTTP.createServer( app )

var logger = function( msg )
{
  return function()
  {
    console.log( '===' )
    console.log( msg )
  }
}

server.listen( 8081
  , function()
    {
      logger( 'start' )()

      Request( 'http://localhost:8081/index.js'
        , function( error, response, body )
          {
            console.log( body )
            server.close( logger( 'done' ) )
          }
        )
    }
  )


