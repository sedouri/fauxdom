export function isObjectEmpty( obj )
{
	if ( obj && typeof obj === "object" )
		for ( const key in obj ) if ( Object.hasOwn( obj, key ) ) return false;
	return true;
}

// deno-lint-ignore no-control-regex
const stringEscapeRE = /[\x00-\x1F\x22\x27\x5C\x7F-\x9F\u00AD\u0600-\u0604\u070F\u17B4\u17B5\u200C-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\uFFF0-\uFFFF]/g;
export function stringEscape( string, quoteChar, re = stringEscapeRE )
{
	let quoteCode = 0;
	
	if ( typeof quoteChar === "string" && quoteChar.length > 0 )
		quoteCode = quoteChar.charCodeAt( 0 );
	
	return string.replace( re, function( chr )
	{
		const charCode = chr.charCodeAt( 0 );
		if ( charCode < 0xFF )
		{
			switch ( charCode )
			{
				case 0: case 1: case 2: case 3:
				case 4: case 5: case 6: case 7:
					return "\\"+ charCode;
				case 0x08: return "\\b";
				case 0x09: return "\\t";
				case 0x0A: return "\\n";
				case 0x0B: return "\\v";
				case 0x0C: return "\\f";
				case 0x0D: return "\\r";
				case 0x22: return charCode !== quoteCode ? '"' : '\\"';
				case 0x27: return charCode !== quoteCode ? "'" : "\\'";
				case 0x5C: return "\\\\";
			}
			return "\\x" + stringPad( charCode.toString( 16 ), 2, "0" );
		}
		return "\\u" + stringPad( charCode.toString( 16 ), 4, "0" );
	} );
}

export function stringPad( string, length, padding )
{
	const diff = length - string.length;
	if ( diff <= 0 ) return string;
	if ( !padding || typeof padding !== "string" ) padding = " ";
	return padding.repeat( Math.ceil( diff / padding.length ) ).slice( 0, diff ) + string;
}

export function stringTruncate( string, length, replacement )
{
	if ( !replacement || typeof replacement !== "string" ) replacement = "...";
	if ( string.length > length )
	{
		const chunkLength = ((length - replacement.length) / 2) | 0;
		return string.slice( 0, chunkLength ) + replacement + string.slice( -(length - chunkLength) );
	}
	return string;
}