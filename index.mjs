import fs from "node:fs"
import path from "node:path"
import DOM from "./lib/fauxdom.mjs"

let standardEntities;

DOM.prototype.importStandardEntities = function()
{
	this.entityEncoder.entities = importStandardEntities();
}
DOM.importStandardEntities = function()
{
	DOM.EntityEncoder.defaultEntities = importStandardEntities();
}

function importStandardEntities()
{
	if ( !standardEntities )
	{
		const entitiesPath = path.resolve( "./lib/entities.json" );
		if ( fs.existsSync( entitiesPath ) )
			standardEntities = JSON.parse( fs.readFileSync( entitiesPath, "utf8" ) );
		else standardEntities = {};
	}
	return standardEntities;
}

export default DOM;