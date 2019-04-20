export class HTTP {

    constructor( baseUrl ) {
        this.baseUrl = baseUrl
    }

    get( url ) {
        return fetch( this.baseUrl + url )
            .then( response => response.json() )
    }
}
