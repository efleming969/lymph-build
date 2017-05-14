var FS = require( "fs-extra" )
var Path = require( "path" )

var Build = require( "./build" )

describe( "building client app", function() {

  process.env.LYMPH_VALID = "foobar"

  var config = {
    src: "test-files/src"
  , static: "test-files/static"
  , build: "tmp/build"
  , templateData: { name1: "env.LYMPH_VALID",  name2: "env.LYMPH_INVALID" }
  , dependencies: [ "ramda" ]
  }

  beforeAll( function() {
    return Build.run( config )
  } )

  afterAll( function() {
    return FS.remove( config.build )
  } )

  test( "main js file is created", function() {
    var jsFile = FS.readFileSync( Path.join( config.build, "index.js" ) )
    expect( jsFile ).toBeTruthy()
  } )

  test( "dependencies js file is created", function() {
    var jsFile = FS.readFileSync( Path.join( config.build, "deps.js" ) )
    expect( jsFile ).toBeTruthy()
  } )

  test( "main html file is created", function() {
    var htmlFile = FS.readFileSync( Path.join( config.build, "index.html" ) )
    expect( htmlFile ).toBeTruthy()
  } )

  test( "main css file is created", function() {
    var cssFile = FS.readFileSync( Path.join( config.build, "index.html" ) )
    expect( cssFile ).toBeTruthy()
  } )

  test( "images files are copies", function() {
    var images = FS.readdirSync( Path.join( config.build, "images" ) )
    expect( images.length ).toBe( 3 )
  } )

  test( "valid environment variables in template", function() {
    var html = FS.readFileSync(
      Path.join( config.build, "index.html" ), "utf8" )
    expect( html ).toMatch( /<title>foobar<\/title>/ )
  } )

  test( "invalid environment variables in template", function() {
    var html = FS.readFileSync(
      Path.join( config.build, "index.html" ), "utf8" )
    expect( html ).toMatch( /<h1>env.LYMPH_INVALID<\/h1>/ )
  } )
} )
