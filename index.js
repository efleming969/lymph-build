var browserify = require( "browserify" )

var logger = function( name )
{
  return function( thing )
  {
    console.log( name, thing )
  }
}

exports.create = function( file )
{
  var browserifyConfig =
    { debug: true
    , standalone: "Main"
    , cache: {}
    , packageCache: {}
    , plugin: []
    }

  var browserfier = browserify( browserifyConfig )
    .require( file, { entry: true } )
    .on( "update", logger( "update" ) )
    .on( "log", logger( "log" ) )

  return function( req, res )
  {
    var respondWithError = function( err )
    {
      console.log( err.message )
      res.status( 500 ).send( err.message )
      this.emit( "end" )
    }

    res.set( "Content-Type", "application/javascript" )

    browserfier
      .bundle()
      .on( "error" , respondWithError )
      .pipe( res )
  }
}

