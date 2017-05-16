var FS = require( "fs-extra" )
var Path = require( "path" )

var Build = require( "./build" )

describe( "building the app", function() {

  process.env.LYMPH_VALID = "foobar"

  var readClientFile = function( name ) {
    return FS.readFileSync( Path.join( "tmp", "build", "client", name ), "utf8" )
  }

  var config = {
    src: "test-files"
  , build: "tmp/build"
  , templateData: { name1: "env.LYMPH_VALID",  name2: "env.LYMPH_INVALID" }
  , dependencies: [ "ramda" ]
  , services: [ "fizz", "buzz" ]
  }

  beforeAll( function() {
    return Build.run( config )
  } )

  afterAll( function() {
    return FS.remove( config.build )
  } )

  test( "main js file is created", function() {
    expect( readClientFile( "index.fabEvHp4.js" ) ).toBeTruthy()
  } )

  test( "dependencies js file is created", function() {
    expect( readClientFile( "deps.SaRSp0Am.js" ) ).toBeTruthy()
  } )

  test( "main html file is created", function() {
    expect( readClientFile( "index.html" ) ).toBeTruthy()
  } )

  test( "main css file is created", function() {
    expect( readClientFile( "index.css" ) ).toBeTruthy()
  } )

  test( "images files are copies", function() {
    var images = FS.readdirSync( Path.join( config.build, "client", "images" ) )
    expect( images.length ).toBe( 3 )
  } )

  test( "valid environment variables in template", function() {
    expect( readClientFile( "index.html" ) )
      .toMatch( /<title>foobar<\/title>/ )
  } )

  test( "invalid environment variables in template", function() {
    expect( readClientFile( "index.html" ) )
      .toMatch( /<h1>env.LYMPH_INVALID<\/h1>/ )
  } )

  test( "building zip file for each lambda service", function() {
    var services = FS.readdirSync( Path.join( config.build, "server" ) )
    expect( services ).toEqual( [ "buzz.zip", "fizz.zip" ] )
  } )
} )
