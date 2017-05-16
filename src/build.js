var FS = require( "fs-extra" )
var Path = require( "path" )
var Browserify = require( "browserify" )
var Mustache = require( "mustache" )
var R = require( "ramda" )
var Archiver = require( "archiver" )
var Crypto = require( "crypto" )

var createShortHash = function( buffer ) {
  return Crypto.createHash( "sha256" )
    .update( buffer )
    .digest( "base64" )
    .slice( 0,8 )
}

var buildScript = function( config ) {
  return new Promise( function( resolve, reject ) {
    Browserify( { bundleExternal: false } )
      .add( Path.join( config.src, "client", "index.js" ) )
      .bundle( function( err, buffer ) {
        if ( err ) {
          reject( err )
        }
        else {

          var shortHash = createShortHash( buffer )
          var fileName = `index.${ shortHash }.js`
          var targetPath = Path.join( config.build, "client", fileName )

          FS.outputFile( targetPath, buffer, function( err ) {
            err ? reject( err ) : resolve( config )
          } )
        }
      } )
  } )
}

var buildDependencies = function( config ) {
  return new Promise( function( resolve, reject ) {
    Browserify()
      .require( config.dependencies )
      .bundle( function( err, buffer ) {
        if ( err ) {
          reject( err )
        }
        else {
          var shortHash = createShortHash( buffer )
          var fileName = `deps.${ shortHash }.js`
          var targetPath = Path.join( config.build, "client", fileName )

          FS.outputFile( targetPath, buffer, function( err ) {
            err ? reject( err ) : resolve( config )
          } )
        }
      } )
  } )
}

var buildTemplate = function( config ) {
  var srcPath = Path.join( config.src, "client", "index.html" )
  var targetPath = Path.join( config.build, "client", "index.html" )

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
  var srcPath = Path.join( config.src, "client", "index.css" )

  return new Promise( function( resolve, reject ) {
    FS.readFile( srcPath, function( err, buffer ) {
      if ( err ) {
        reject( err )
      }
      else {
        var shortHash = createShortHash( buffer )
        var fileName = `index.${ shortHash }.css`
        var targetPath = Path.join( config.build, "client", fileName )

        FS.outputFile( targetPath, buffer, function( err ) {
          err ? reject( err ) : resolve( config )
        } )
      }
    } )
  } )
}

var copyStatics = function( config ) {
  var srcPath = Path.join( config.src, "client", "static" )
  var targetPath = Path.join( config.build, "client" )

  return new Promise( function( resolve, reject ) {
    FS.copy( srcPath, targetPath, function( err ) {
      err ? reject( err ) : resolve( config )
    } )
  } )
}

var buildService = function( service ) {
  return new Promise( function( resolve, reject ) {
    var browserifyOptions = {
      standalone: "lambda"
    , builtins: false
    , commondir: false
    , browserField: false
    , insertGlobalVars: { process: function() { return; } }
    }

    Browserify( browserifyOptions )
      .add( service.srcPath )
      .bundle( function( err, bundleBuffer ) {
        if ( err ) {
          reject( err )
        }
        else {
          zipService( service.targetPath, bundleBuffer, function( err ) {
            err ? reject( err ) : resolve()
          } )
        }
      } )
  } )
}

var zipService = function( targetPath, bundleBuffer, callback ) {
  var archive = Archiver( "zip" )
  var buffers = []

  archive.on( "error", function( err ) {
    callback( err )
  } )

  archive.on( "data", function( buffer ) {
    buffers.push( buffer )
  } )

  archive.on( "end", function() {
    FS.outputFile( targetPath, Buffer.concat( buffers ), function( err ) {
      callback( err )
    } )
  } )

  // appending standard name and date inorder make sure zip file
  // passes sha hashing checks
  archive.append( bundleBuffer
  , { name: "index.js", date: new Date( "01-01-2017 12:00:00" ) } )

  archive.finalize()
}

var buildServices = function( config ) {
  var services = config.services.map( function( name ) {
    return buildService( {
        srcPath: Path.join( config.src, "server", `${ name }.js` )
      , targetPath: Path.join( config.build, "server", `${ name }.zip` )
    } )
  } )

  return Promise.all( services )
}

var isEnvironmentVar = v => R.is( String, v) && v.startsWith( "env" )

var translateEnv = envs => s => isEnvironmentVar( s )
  ? R.defaultTo( s, envs[ s.slice( 4 ) ] ) : s

var preProcessTemplateData = envs => R.evolve(
  { templateData: R.map( translateEnv( envs ) ) } )

var resolvePaths = function( config ) {
  return R.merge( config, {
      src: Path.resolve( config.src )
    , build: Path.resolve( config.build )
  } )
}

exports.run = function( config ) {
  return Promise.resolve( config )
    .then( preProcessTemplateData( process.env ) )
    .then( resolvePaths )
    .then( copyStatics )
    .then( buildScript )
    .then( buildDependencies )
    .then( buildTemplate )
    .then( buildStyle )
    .then( buildServices )
}
