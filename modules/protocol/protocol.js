exports.module = {
	
	client : null,
		
	start : ( data ) => {

		const apiURI = 'https://api.gdax.com';
		const sandboxURI = 'https://api-public.sandbox.gdax.com';
		
		var gdax = require('gdax');
		this.client = new gdax.AuthenticatedClient(
			data.config.api_key,
			data.config.api_secret,
			data.config.api_passphrase,
			data.config.production ? apiURI : sandboxURI
		);
		
	},
	
	execute : ( cmd, data, callback ) => {
		data.push( ( error, response, data ) => {
			callback( data );
		});
		this.client[ cmd ].apply( this.client, data );
	},
	
};
