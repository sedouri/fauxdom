const nodeTypes = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2, // Unused
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5, // Unused, historical
	ENTITY_NODE: 6, // Unused, historical
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12 // Unused, historical
};

function printHierarchy( elem, prefix = undefined )
{
	var result = "",
		following = " ",
		nodes;
	
	if ( typeof prefix !== "string" )
		prefix = "";
	
	if ( prefix )
		result += prefix +"─╴";
	
	if ( elem instanceof Array )
	{
		result += "#array["+ elem.length +"]";
		nodes = elem;
	}
	else
	{
		if ( elem ) nodes = elem.childNodes;
		result += describeNode( elem );
	}
	
	if ( nodes )
	{
		result += "\n";
		prefix = prefix.replace( "└", " " ).replace( "├", "│" );
		if ( nodes.length > 1 )
			following = "├";
		for ( let i = 0, l = nodes.length; i < l; i++ )
		{
			if ( i === l - 1 )
				following = "└";
			result += printHierarchy( nodes[i], prefix ? prefix +"   "+ following : " "+ following );
		}
	}
	
	if ( result && !result.endsWith( "\n" ) )
		result += "\n";
	
	return result;
}

function printElementList( list )
{
	var result = "";
	if ( list instanceof Array ) for ( let i = 0; i < list.length; i++ )
	{
		if ( result ) result += "\n";
		result += describeNode( list[i] );
	}
	return result;
}

function describeNode( elem )
{
	var desc = "";
	
	switch ( typeof elem )
	{
		case "object":
			if ( !elem ) return null;
			
			if ( elem.nodeType === nodeTypes.DOCUMENT_TYPE_NODE )
				desc += elem.outerHTML;
			else if ( elem.nodeType === nodeTypes.PROCESSING_INSTRUCTION_NODE )
			{
				desc += "<?"+ elem.nodeName;
				if ( elem.nodeValue )
					desc += " "+ elem.nodeValue;
				desc += "?>";
			}
			else
			{
				if ( elem.nodeType === nodeTypes.ELEMENT_NODE )
					desc += "<";
				
				desc += elem.nodeName;
				
				if ( elem.attributes && !isObjectEmpty( elem.attributes ) )
				{
					desc += " ";
					for ( let k in elem.attributes ) if ( elem.attributes.hasOwnProperty( k ) )
					{
						if ( elem.attributes[k] === true ) desc += k +" ";
						else desc += k +'="'+ stringTruncate( stringEscape( ""+ elem.attributes[k], '"' ), 50 ) +'" ';
					}
					desc = desc.trim();
				}
				
				if ( elem.nodeType === nodeTypes.ELEMENT_NODE )
					desc += ">";
			}
			
			if ( elem.nodeType !== nodeTypes.PROCESSING_INSTRUCTION_NODE && typeof elem.nodeValue === "string" )
			{
				if ( elem.nodeValue )
					desc += ' :: "'+ stringTruncate( stringEscape( ""+ elem.nodeValue, '"' ), 75 ) +'"';
				else desc += ' :: ""';
			}
			
			break;
			
		default: return JSON.stringify( elem );
	}
	
	return desc;
}

function isObjectEmpty( obj )
{
	if ( obj && typeof obj === "object" )
		for ( let k in obj ) if ( obj.hasOwnProperty( k ) ) return false;
	return true;
}

const stringEscapeRE = /[\x00-\x1F\x22\x27\x5C\x7F-\x9F\u00AD\u0600-\u0604\u070F\u17B4\u17B5\u200C-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\uFFF0-\uFFFF]/g;
function stringEscape( string, quoteChar )
{
	var quoteCode = 0;
	
	if ( typeof quoteChar === "string" && quoteChar.length > 0 )
		quoteCode = quoteChar.charCodeAt( 0 );
	
	return string.replace( stringEscapeRE, function( chr )
	{
		var charCode = chr.charCodeAt( 0 );
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

function stringPad( string, length, padding )
{
	const diff = length - string.length;
	if ( diff <= 0 ) return string;
	if ( !padding || typeof padding !== "string" ) padding = " ";
	return padding.repeat( Math.ceil( diff / padding.length ) ).slice( 0, diff ) + string;
}

function stringTruncate( string, length, replacement )
{
	if ( !replacement || typeof replacement !== "string" ) replacement = "...";
	if ( string.length > length )
	{
		const chunkLength = ((length - replacement.length) / 2) | 0;
		return string.slice( 0, chunkLength ) + replacement + string.slice( -(length - chunkLength) );
	}
	return string;
}

module.exports = {
	printHierarchy,
	printElementList,
	describeNode
};