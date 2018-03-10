exports.module = {
	
	start : ( data ) => {

		var express = require( 'express' );
		var twig = require( 'twig' );
		twig.cache( false );
		
		var app = new express();
		var ws = require( 'express-ws' )( app );
		
		app.use( express.static( './public' ) );
		app.get( '/', ( req, res ) => {
			res.render( 'index.html.twig', {
				
			});
		});
		
		app.ws( '/ws', ( ws, req ) => {
			ws.on( 'message', ( msg ) => {
				var req = JSON.parse( msg );
				data.modules.protocol.execute( req.cmd, req.data, ( res ) => {
					try {
						ws.send( JSON.stringify( res ) );
					} catch ( e ) {
						
					}
				});
			});
		});
		
		app.listen( data.config.port, () => {
			console.log( 'listening on ' + data.config.port );
		});
		
	},
	
};
