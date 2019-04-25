const Server = require( "../src/main/server" )

Server.start( {
    src: "../src/test/example/source",
    dist: "../dist",
    context: "/erick",
    port: 8080
} )
