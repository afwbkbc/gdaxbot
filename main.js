var chdir = require('chdir');

var data = {
	config: require( './config.js' ).config,
	modules: {},
};

[
	'ui',
	'protocol',
].forEach( name => {
	chdir( './modules/' + name, () => {
		data.modules[ name ] = require( './modules/' + name + '/' + name + '.js' ).module;
	});
} );

for ( var name in data.modules ) {
	var module = data.modules[ name ];
	chdir( './modules/' + name, () => {
		module.start( data );
	});
}