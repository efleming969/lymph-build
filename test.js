var HTTP = require( "http" )
var Express = require( "express" )
var SuperAgent = require( "superagent" )

var Bundler = require( "./index" )

var app = Express()

app.get( "/", function( req, res ) { res.send( 'hello' ) } )
app.get( "/index.js", Bundler( "./index.js" ) )

var server = HTTP.createServer( app )

server.listen( 8081
  , function()
    {
      console.log( 'tests started' )
      console.log( '==' )

      SuperAgent
        .get( 'http://localhost:8081/index.js' )
        .end(
            function( err, res ) {
              console.log( res.text )
              server.close( function() {
                console.log( '==' )
                console.log( 'tests finished' )
              } )
            }
          )
    }
  )


