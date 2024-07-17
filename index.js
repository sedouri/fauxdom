const fs = require( "node:fs" );
const path = require( "node:path" );
let standardEntities;

module.exports = require( "./lib/fauxdom.cjs" );

module.exports.prototype.importStandardEntities = function()
{
	this.entityEncoder.entities = importStandardEntities();
}
module.exports.importStandardEntities = function()
{
	module.exports.EntityEncoder.defaultEntities = importStandardEntities();
}

function importStandardEntities()
{
	if ( !standardEntities )
	{
		const entitiesPath = path.resolve( __dirname +"/lib/entities.json" );
		if ( fs.existsSync( entitiesPath ) )
			standardEntities = JSON.parse( fs.readFileSync( entitiesPath, "utf8" ) );
		else standardEntities = {};
	}
	return standardEntities;
}