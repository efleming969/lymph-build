const Server = require( "../src/main/server" )

Server.start( {
    src: "../src/test/example/source",
    dist: "../dist",
    context: "/erick",
    proxyPort: 8081,
    port: 8080
} )
