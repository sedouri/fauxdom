const https = require( "https" ),
	fs = require( "fs" ),
	path = require( "path" ),
	{zip} = require( "compressing" ),
	{stringEscape} = require( "./utils" );
	
	entityNameRE = /[&;]/g,
	stringEscapeRE = /[\x00-\x1F\x22\x27\x5C\x7F-\uFFFF]/g;

function processEntities( str )
{
	const data = JSON.parse( str ),
		entityList = Object.getOwnPropertyNames( data ).
			sort( ( a, b ) => a.localeCompare( b, "en", {sensitivity: "base"} ) ),
		entities = {},
		duplicates = new Map();
	
	for ( let i = 0; i < entityList.length; i++ )
	{
		const name = entityList[i].replace( entityNameRE, "" ),
			nameLC = name.toLowerCase();
		
		if ( !entities.hasOwnProperty( name ) )
		{
			let chars = data[entityList[i]].characters;
			if ( chars.length === 1 )
			{
				const cp = chars.codePointAt( 0 );
				if ( cp < 0x7f ) switch ( cp )
				{
					case 9: chars = "\\t"; break;
					case 10: chars = "\\n"; break;
					case 13: chars = "\\r"; break;
					default: if ( cp > 0x20 ) chars = stringEscape( String.fromCodePoint( cp ), '"', stringEscapeRE );
				}
				else if ( cp < 65535 )
					chars = cp;
				else chars = stringEscape( chars, null, stringEscapeRE );
			}
			else chars = stringEscape( chars, null, stringEscapeRE );
			
			if ( duplicates.has( nameLC ) )
			{
				const realName = duplicates.get( nameLC );
				if ( entities[realName] === chars )
				{
					delete entities[realName];
					duplicates.delete( nameLC );
					duplicates.set( nameLC, name );
				}
			}
			else duplicates.set( nameLC, name );
			
			entities[name] = chars;
		}
	}
	
	let entitiesStr = "{";
	for ( let k in entities )
	{
		const value = entities[k];
		if ( entitiesStr !== "{" ) entitiesStr += ",";
		entitiesStr += '"'+ k +'":';
		if ( typeof value === "string" )
			entitiesStr += '"'+ value +'"';
		else entitiesStr += value;
	}
	entitiesStr += "}";
	
	if ( !fs.existsSync( "./lib" ) )
		fs.mkdirSync( "./lib" );
	
	const filePath = path.resolve( "./lib/entities" ),
		escapedEntitiesStr = "JSON.parse('"+ stringEscape( entitiesStr, "'", stringEscapeRE ) +"')";
	outputFile( filePath +".json", entitiesStr );
	outputFile( filePath +".js", "if(window.DOM)DOM.EntityEncoder.defaultEntities="+ escapedEntitiesStr );
	outputFile( filePath +".mjs", "export default "+ escapedEntitiesStr );
}

if ( fs.existsSync( "./scripts/entities.raw.json" ) )
{
	processEntities( fs.readFileSync( "./scripts/entities.raw.json", "utf8" ) );
}
else
{
	https.request( "https://html.spec.whatwg.org/entities.json", res =>
	{
		var entities = "";
		res.on( "data", data =>
			{
				entities += data;
			} ).
			on( "end", () =>
			{
				fs.writeFileSync( "./scripts/entities.raw.json", entities );
				processEntities( entities );
			} );
	} ).
	on( "error", err =>
	{
		console.error( err );
		process.exit( -1 );
	} ).
	end();
}

function outputFile( filePath, contents )
{
	const ext = path.extname( filePath ),
		fileName = path.basename( filePath, ext ),
		dirName = path.dirname( filePath );
	
	fs.writeFile( filePath, contents, err => {if ( err ) console.error( "Error writing "+ filePath +"\n"+ err )} );
	
	if ( ext === ".js" || ext === ".mjs" )
		zip.compressFile(
			Buffer.from( contents ),
			path.join( dirName, fileName + (ext === ".mjs" ? ".module" : "") +".zip" ),
			{relativePath: fileName +".js"}
		);
}