const https = require( "https" );
const fs = require( "fs" );
const path = require( "path" );
const {zip} = require( "compressing" );
const {stringEscape} = require( "./utils" );

const entityNameRE = /[&;]/g;
// deno-lint-ignore no-control-regex
const stringEscapeRE = /[\x00-\x1F\x22\x27\x5C\x7F-\uFFFF]/g;

function processEntities( str )
{
	const data = JSON.parse( str );
	const entityList = Object.getOwnPropertyNames( data ).
			sort( ( a, b ) => a.localeCompare( b, "en", {sensitivity: "base"} ) );
	const entities = {};
	const duplicates = new Map();
	
	for ( let i = 0; i < entityList.length; i++ )
	{
		const name = entityList[i].replace( entityNameRE, "" );
		const nameLC = name.toLowerCase();
		
		if ( !Object.hasOwn( entities, name ) )
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
	for ( const key in entities )
	{
		const value = entities[key];
		if ( entitiesStr !== "{" ) entitiesStr += ",";
		entitiesStr += '"'+ key +'":';
		if ( typeof value === "string" )
			entitiesStr += '"'+ value +'"';
		else entitiesStr += value;
	}
	entitiesStr += "}";
	
	if ( !fs.existsSync( "./lib" ) )
		fs.mkdirSync( "./lib" );
	
	const filePath = path.resolve( "./lib/entities" );
	const escapedEntitiesStr = "JSON.parse('"+ stringEscape( entitiesStr, "'", stringEscapeRE ) +"')";
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
		let entities = "";
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
	const ext = path.extname( filePath );
	const fileName = path.basename( filePath, ext );
	const dirName = path.dirname( filePath );
	
	fs.writeFile( filePath, contents, err => {if ( err ) console.error( "Error writing "+ filePath +"\n"+ err )} );
	
	if ( ext === ".js" || ext === ".mjs" )
		zip.compressFile(
			Buffer.from( contents ),
			path.join( dirName, fileName + (ext === ".mjs" ? ".module" : "") +".zip" ),
			{relativePath: fileName +".js"}
		);
}