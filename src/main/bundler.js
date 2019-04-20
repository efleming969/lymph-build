const FS = require( "fs" )
const Path = require( "path" )
const Mustache = require( "mustache" )
const Shell = require( "shelljs" )
const Rollup = require( "rollup" )

const rewriteAnchors = function ( html ) {
    return html.replace( /href="(.*)\.mustache"/g, function ( match, fileName ) {
        return `href="${ fileName }.html"`
    } )
}

const bundleScripts = function ( sourceDirectoryPath, distDirectoryPath, html ) {
    const re = /<script src="(.*\.js)"><\/script>/g
    const matches = html.match( re )

    if ( matches ) {
        matches.forEach( async function ( scriptTag ) {
            const re = /<script src="(.*\.js)"><\/script>/g
            const scriptFileName = re.exec( scriptTag )[ 1 ]

            const inputOptions = {
                input: Path.join( sourceDirectoryPath, scriptFileName )
            }

            const namespaceName = "Acme" + scriptFileName.split( "/" ).map( function ( name ) {
                return name.slice( 0, 1 ).toUpperCase() + name.slice( 1 )
            } ).join( "" )

            const outputOptions = {
                file: Path.join( distDirectoryPath, scriptFileName ),
                format: "iife",
                name: Path.basename( namespaceName, ".js" )
            }

            const bundle = await Rollup.rollup( inputOptions )

            await bundle.write( outputOptions )
        } )
    }

    return html;
}

module.exports = class Builder {

    async build( sourceDirectoryPath, distDirectoryPath ) {
        Shell.mkdir( "-p", distDirectoryPath )

        const templatePaths = Shell.ls( Path.join( sourceDirectoryPath, "*.mustache" ) )

        console.log( "building", sourceDirectoryPath )

        return Promise.all( templatePaths.map( function ( templatePath ) {
            return new Promise( function ( resolve, reject ) {
                const config = require( Path.join( sourceDirectoryPath, "data.js" ) )

                FS.readFile( templatePath, "utf8", function ( error, templateString ) {
                    const html = Mustache.render( templateString, config )
                    const htmlWithRewrites = rewriteAnchors( html )
                    const htmlWithScripts = bundleScripts( sourceDirectoryPath, distDirectoryPath, htmlWithRewrites )
                    const targetFileName = Path.basename( templatePath, ".mustache" ) + ".html"
                    const targetFile = Path.join( distDirectoryPath, targetFileName )

                    FS.writeFile( targetFile, htmlWithScripts, "utf8", function ( error ) {
                        if ( !error )
                            resolve( targetFile )
                        else
                            reject( error )
                    } )
                } )
            } )
        } ) )
    }
}

// build( "index.mustache" )

// templates.forEach( function ( templatePath ) {
//     FS.readFile( templatePath, "utf8", function ( error, templateString ) {
//         if ( error ) {
//             console.log( error )
//         } else {
//             const html = Mustache.render( templateString, config )
//             const targetFile = Path.join( cwd, "dist", Path.basename( templatePath ) )
//             FS.writeFile( targetFile, html, "utf8", function ( error ) {
//                 if ( error ) {
//                     console.log( error )
//                 }
//             } )
//         }
//     } )
// } )

