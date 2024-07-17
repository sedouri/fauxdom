import {isObjectEmpty, stringEscape, stringTruncate} from "./utils.js"

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

export function printHierarchy( elem, prefix = "" )
{
	let result = "";
	let following = " ";
	let nodes;
	
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

export function printElementList( list )
{
	let result = "";
	if ( list instanceof Array ) for ( let i = 0; i < list.length; i++ )
	{
		if ( result ) result += "\n";
		result += describeNode( list[i] );
	}
	return result;
}

export function describeNode( elem )
{
	let desc = "";
	
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
					for ( const key in elem.attributes ) if ( Object.hasOwn( elem.attributes, key ) )
					{
						if ( elem.attributes[key] === true ) desc += key +" ";
						else desc += key +'="'+ stringTruncate( stringEscape( ""+ elem.attributes[key], '"' ), 50 ) +'" ';
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