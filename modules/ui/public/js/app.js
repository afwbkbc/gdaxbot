$( window ).ready( () => {
	
	var div = {
		products : $( '.products' ),
	};
	
	var ws = new WebSocket( 'ws://' + window.location.host + '/ws', [ 'protocolOne', 'protocolTwo' ] );
	
	ws.onerror = ( event ) => {
		alert( 'ws failed' );
	};
	
	ws.onopen = () => {
		
		var callbacks = [];
		
		var get = ( cmd, data, callback ) => {
			callbacks.push( callback );
			ws.send( JSON.stringify({
				cmd: cmd,
				data: data,
			}));
		};
		
		ws.onmessage = ( event ) => {
			var callback = callbacks.pop();
			callback( JSON.parse( event.data ) );
		};
		
		get( 'getProducts', [], ( res ) => {
			
			var products = {};
			
			res.forEach( ( product ) => {
				$( '<span></span>' ).attr( 'id', product.id ).html( product.id ).appendTo( div.products );
				products[ product.id ] = product;
			});
			
			div.products.on( 'click', '> span', ( event ) => {
				var span = $( event.target );
				div.products.find( '> span ').removeClass( 'active' );
				span.addClass( 'active' );
				var product = products[ span.attr( 'id' ) ];
				console.log( product );
			});
			$( '#' + res[0].id ).click();

		});
		
	};
	
} );
