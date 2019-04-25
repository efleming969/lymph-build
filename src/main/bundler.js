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

const bundleStyles = function ( sourceDirectoryPath, distDirectoryPath, html ) {
    const re = /<link rel="stylesheet" href="(.*\.css)">/g
    const matches = html.match( re )

    if ( matches ) {
        matches.forEach( async function ( styleTag ) {
            const styleFileName = re.exec( styleTag )[ 1 ]

            Shell.cp(
                Path.join( sourceDirectoryPath, styleFileName ),
                Path.join( distDirectoryPath, styleFileName ) )
        } )
    }

    return html;
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

            const namespace = "ScriptsShared"

            const outputOptions = {
                file: Path.join( distDirectoryPath, scriptFileName ),
                format: "iife",
                name: Path.basename( namespace, ".js" )
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
                    const htmlWithStyles = bundleStyles( sourceDirectoryPath, distDirectoryPath, htmlWithScripts )
                    const targetFileName = Path.basename( templatePath, ".mustache" ) + ".html"
                    const targetFile = Path.join( distDirectoryPath, targetFileName )

                    FS.writeFile( targetFile, htmlWithStyles, "utf8", function ( error ) {
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
