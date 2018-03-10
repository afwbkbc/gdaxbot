$( window ).ready( () => {
	
	var div = {
		products : $( '.products' ),
		product: $( '.product' ),
	};
	
	var ws = new WebSocket( 'ws://' + window.location.host + '/ws', [ 'protocolOne', 'protocolTwo' ] );
	
	ws.onerror = ( event ) => {
		alert( 'ws failed' );
	};
	
	ws.onopen = () => {
		
		var callbacks = [];
		
		var gdax = ( cmd, data, callback ) => {
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
		
		gdax( 'getProducts', [], ( res ) => {
			
			var products = {};
			
			res.forEach( ( product ) => {
				$( '<span></span>' ).attr( 'id', product.id ).html( product.id ).appendTo( div.products );
				products[ product.id ] = product;
			});
			
			class Ticker {
				constructor( pair ) {
					this.pair = pair;
					this.active = true;
					div.product.hide();
					this.update( () => {
						div.product.show();
					});
				}
				destroy() {
					this.active = false;
				}
				update( callback ) {
					var that = this;
					gdax( 'getProductTrades', [
						this.pair,
					], ( res ) => {
						if ( !that.active )
							return;
						
						var constraints = {
							time : {
								low : new Date( res[ res.length - 1 ].time ).getTime(),
								high : new Date( res[ 0 ].time ).getTime(),
							},
							price : {},
						};
						
						res.forEach( ( data ) => {
							if ( typeof ( constraints.price.low ) === 'undefined' || data.price > constraints.price.low )
								constraints.price.low = data.price;
							if ( typeof ( constraints.price.high ) === 'undefined' || data.price < constraints.price.high )
								constraints.price.high = data.price;
						});
						constraints.time.range = constraints.time.high - constraints.time.low;
						constraints.price.range = constraints.price.high - constraints.price.low;
						
						var canvas = div.product.find( '> .chart' );
						var ctx = canvas[0].getContext("2d");
						
						var cwidth = canvas.attr( 'width' );
						var cheight = canvas.attr( 'height' );
						
						var cx = ( time ) => {
							return ( time - constraints.time.low ) * cwidth / constraints.time.range;
						};
						var cy = ( price ) => {
							return ( price - constraints.price.low ) * cheight / constraints.price.range;
						}
						
						ctx.strokeStyle = "#FF0000";

						for ( var i = res.length - 1; i >= 0 ; i-- ) {
							var data = res[ i ];
							
							var x = cx( new Date( data.time ).getTime() );
							var y = cy( data.price );
							
							console.log( x, y, data.price );
							
							if ( i == res.length - 1 )
								ctx.moveTo( x, y );
							else
								ctx.lineTo( x, y );
							
							ctx.stroke();
						}
						
						console.log( constraints );
						
						div.product.show();
					} );
				}
			};
			
			var ticker = null;
			
			div.products.on( 'click', '> span', ( event ) => {
				var span = $( event.target );
				div.products.find( '> span ').removeClass( 'active' );
				span.addClass( 'active' );
				var product = products[ span.attr( 'id' ) ];
				
				if ( ticker )
					ticker.destroy();
				ticker = new Ticker( product.id );
			});
			$( '#' + res[0].id ).click();

		});
		
	};
	
} );
