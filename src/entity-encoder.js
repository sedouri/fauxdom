import {globalizeRegExp} from "./utils.js";

const decodingRE = /&(#\d+|#[xX][0-9a-fA-F]+|[0-9a-zA-Z]+);?/g,
	
	// From 'SyntaxCharacter' in section 21.2.1 (Patterns) of the ECMAScript 6.0 spec.
	regExpEscapeRE = /[\^$\\.*+?()[\]{}|]/g,
	
	_defaultEntities = processEntities( {
		"amp": "&",
		"apos": "'",
		"copy": 169,
		"gt": ">",
		"lt": "<",
		"nbsp": 160,
		"quot": '"'
	} );

let defaultEntities = _defaultEntities;

export default class EntityEncoder
{
	constructor( entities )
	{
		this.entities = entities || "default";
	}
	
	encode( string, what )
	{
		if ( !this.encodingReplacements ) return string;
		return string.replace( what instanceof RegExp ? globalizeRegExp( what ) : this.encodingRE, chr => this.encodingReplacements[chr] || chr );
	}
	
	decode( string )
	{
		if ( !this.decodingReplacements ) return string;
		return string.replace( decodingRE, ( _, m ) =>
		{
			if ( m[0] === "#" )
			{
				if ( m[1] === "x" || m[1] === "X" )
					m = parseInt( m.slice( 2 ), 16 ) | 0;
				else m = m.slice( 1 ) | 0;
				return String.fromCodePoint( m );
			}
			return this.decodingReplacements[m] || this.decodingReplacements[m.toLowerCase()] || _;
		} );
	}
	
	set entities( entities )
	{
		if ( entities === "default" )
			entities = defaultEntities;
		else if ( !entities || !(entities.encodingRE instanceof RegExp) )
			entities = processEntities( entities );
		
		this.encodingRE = entities.encodingRE;
		this.encodingReplacements = entities.encodingReplacements;
		this.decodingReplacements = entities.decodingReplacements;
	}
	
	static set defaultEntities( entities )
	{
		if ( entities && typeof entities === "object" )
			defaultEntities = processEntities( Object.assign( {}, entities ) );
		else defaultEntities = _defaultEntities;
	}
}

function processEntities( entities )
{
	var result = {
			encodingRE: null,
			encodingReplacements: null,
			decodingReplacements: null
		};
	
	if ( entities && typeof entities === "object" )
	{
		const escapes = {},
			unescapes = {},
			entityList = [];
		
		for ( let k in entities )
			if ( entities.hasOwnProperty( k ) )
			{
				let entity = entities[k];
				
				if ( typeof entity === "number" && isFinite( entity ) )
					entity = String.fromCodePoint( entity );
				else if ( typeof entity !== "string" || entity === "" )
					continue;
				
				entityList.push( entity.replace( regExpEscapeRE, "\\$&" ) );
				if ( !escapes.hasOwnProperty( entity ) || (k.length + 2) < escapes[entity].length )
					escapes[entity] = "&"+ k +";";
				unescapes[k] = entity;
			}
		
		if ( entityList.length > 0 )
		{
			result.encodingRE = new RegExp( entityList.join( "|" ), "g" );
			result.encodingReplacements = escapes;
			result.decodingReplacements = unescapes;
		}
	}
	
	if ( !result.encodingRE )
		result.encodingRE = new RegExp( "(?:)", "g" );
	
	return result;
}