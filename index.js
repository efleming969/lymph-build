#!/usr/bin/env node

var FS = require( "fs-extra" )
var Path = require( "path" )
var R = require( "ramda" )

var Build = require( "./src/build" )

var config = FS.readJsonSync( "./package.json" ).lymph

var configDefault = {
    src: "src"
  , static: "static"
  , build: "tmp/build"
  , templateData: {}
  , dependencies: []
}

Build.run( R.merge( configDefault, config ) )
