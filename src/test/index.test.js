const Path = require( "path" )
const FS = require( "fs" )

const Builder = require( "../main/bundler" )

const cwd = process.cwd()

const readFile = function ( filePath ) {
    return new Promise( function ( resolve, reject ) {
        FS.readFile( filePath, "utf8", function ( error, contents ) {
            if ( error )
                reject( error )
            else
                resolve( contents )
        } )
    } )
}

async function compareFile( fileName ) {
    const targetDirectoryPath = Path.join( cwd, "src/test/example/target" )
    const distDirectoryPath = Path.join( cwd, "dist" )
    const distFilePath = Path.join( distDirectoryPath, fileName )
    const distContents = await readFile( distFilePath )

    const expectedFilePath = Path.join( targetDirectoryPath, fileName )
    const expectedContents = await readFile( expectedFilePath )
    return { distContents, expectedContents }
}

describe( "building projects", function () {
    let builder
    let distDirectoryPath
    let sourceDirectoryPath
    let targetDirectoryPath

    beforeEach( async function () {
        builder = new Builder()

        distDirectoryPath = Path.join( cwd, "dist" )
        sourceDirectoryPath = Path.join( cwd, "src/test/example/source" )
        targetDirectoryPath = Path.join( cwd, "src/test/example/target" )

        await builder.build( sourceDirectoryPath, distDirectoryPath )
    } )

    it( "generates mustache templates", async function () {
        const { distContents, expectedContents } = await compareFile( "index.html" )
        expect( distContents ).toEqual( expectedContents )
    } )

    it( "rewrites mustache hrefs", async function () {
        const { distContents, expectedContents } = await compareFile( "href-rewrites.html" )
        expect( distContents ).toEqual( expectedContents )
    } )

    it( "bundles scripts", async function () {
        const scriptsResults = await compareFile( "scripts.html" )
        expect( scriptsResults.distContents ).toEqual( scriptsResults.expectedContents )

        const utilsResults = await compareFile( "scripts-shared.js" )
        expect( utilsResults.distContents ).toEqual( utilsResults.expectedContents )

        const indexResults = await compareFile( "scripts.js" )
        expect( indexResults.distContents ).toEqual( indexResults.expectedContents )
    } )

    it( "bundles styles", async function () {
        const results = await compareFile( "styles.css" )
        expect( results.distContents ).toEqual( results.expectedContents )
    } )
} )
