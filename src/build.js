var FS = require( "fs-extra" )
var Path = require( "path" )
var Browserify = require( "browserify" )
var Mustache = require( "mustache" )
var R = require( "ramda" )

var buildScript = function( config ) {
  var srcPath = Path.join( config.src, "index.js" )
  var targetPath = Path.join( config.build, "index.js" )

  return new Promise( function( resolve, reject ) {
    Browserify( { bundleExternal: false } )
      .add( srcPath )
      .bundle( function( err, buffer ) {
        if ( err ) {
          reject( err )
        }
        else {
          FS.outputFile( targetPath, buffer, function( err ) {
            err ? reject( err ) : resolve( config )
          } )
        }
      } )
  } )
}

var buildDependencies = function( config ) {
  var targetPath = Path.join( config.build, "deps.js" )

  return new Promise( function( resolve, reject ) {
    Browserify()
      .require( config.dependencies )
      .bundle( function( err, buffer ) {
        if ( err ) {
          reject( err )
        }
        else {
          FS.outputFile( targetPath, buffer, function( err ) {
            err ? reject( err ) : resolve( config )
          } )
        }
      } )
  } )
}

var buildTemplate = function( config ) {
  var srcPath = Path.join( config.src, "index.html" )
  var targetPath = Path.join( config.build, "index.html" )

  return new Promise( function( resolve, reject ) {
    FS.readFile( srcPath, "utf8", function( err, template ) {
      if ( err ) {
        reject( err )
      }
      else {
        FS.outputFile( targetPath
        , Mustache.render( template, config.templateData )
        , function( err ) {
            err ? reject( err ) : resolve( config )
          } )
      }
    } )
  } )
}

var buildStyle = function( config ) {
  var srcPath = Path.join( config.src, "index.css" )
  var targetPath = Path.join( config.build, "index.css" )

  return new Promise( function( resolve, reject ) {
    FS.readFile( srcPath, "utf8", function( err, style ) {
      if ( err ) {
        reject( err )
      }
      else {
        FS.outputFile( targetPath
        , style
        , function( err ) {
            err ? reject( err ) : resolve( config )
          } )
      }
    } )
  } )
}

var copyStatics = function( config ) {
  var srcPath = config.static
  var targetPath = Path.join( config.build )

  return new Promise( function( resolve, reject ) {
    FS.copy( srcPath, targetPath, function( err ) {
      err ? reject( err ) : resolve( config )
    } )
  } )
}

var isEnvironment = v => R.is( String, v) && v.startsWith( "env" )

var translateEnv = s => isEnvironment( s )
  ? R.defaultTo( s, process.env[ s.slice( 4 ) ] ) : s

var preProcessTemplateData = R.evolve(
  { templateData: R.map( translateEnv ) } )

var resolvePaths = function( config ) {
  return R.merge( config, {
      src: Path.resolve( config.src )
    , static: Path.resolve( config.static )
    , build: Path.resolve( config.build )
  } )
}

exports.run = function( config ) {
  return Promise.resolve( config )
    .then( preProcessTemplateData )
    .then( resolvePaths )
    .then( buildScript )
    .then( buildDependencies )
    .then( buildTemplate )
    .then( buildStyle )
    .then( copyStatics )
}

// var deployAs = function( file ) {
//   return function( buffer ) {
//     var s3 = new AWS.S3()
//
//     var putParams = {
//       Bucket: "braintrustgroup"
//       , Key: file.name
//       , ACL: "public-read"
//       , ContentType: file.type
//       , Body: buffer
//     }
//
//     s3.putObject( putParams, function( err, data ) {
//       console.log( err, data )
//     } )
//   }
// }

  // var deployAs = createDeployer( putObject )
