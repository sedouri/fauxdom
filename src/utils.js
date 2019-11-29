const DOCTYPE = Symbol( "doctype" ),
	HEAD = Symbol( "head" ),
	BODY = Symbol( "body" ),
	DOCUMENT_ELEMENT = Symbol( "documentElement" ),
	NODE_TYPE = Symbol( "nodeType" ),
	PARENT_NODE = Symbol( "parentNode" ),
	OWNER = Symbol( "ownerDocument" ),
	TAG_NAME = Symbol( "tagName" ),
	PARSER_OPTIONS = Symbol( "parserOptions" ),
	
	spacesRE = /\s+/g,
/* @START_BROWSER_ONLY */
	reFlagsRE = /[gimsuy]*$/,
/* @END_BROWSER_ONLY */
	
	nodeTypes = {
		ELEMENT_NODE: 1,
		//ATTRIBUTE_NODE: 2, // Unused
		TEXT_NODE: 3,
		CDATA_SECTION_NODE: 4,
		//ENTITY_REFERENCE_NODE: 5, // Unused, historical
		//ENTITY_NODE: 6, // Unused, historical
		PROCESSING_INSTRUCTION_NODE: 7,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_TYPE_NODE: 10,
		DOCUMENT_FRAGMENT_NODE: 11,
		//NOTATION_NODE: 12 // Unused, historical
	},
	
	selfClosingTags = {
		"AREA": true,
		"BASE": true,
		"BR": true,
		"COL": true,
		"COMMAND": true,
		"EMBED": true,
		"HR": true,
		"IMG": true,
		"INPUT": true,
		"KEYGEN": true,
		"LINK": true,
		"META": true,
		"PARAM": true,
		"SOURCE": true,
		"TRACK": true,
		"WBR": true
	};

export {DOCTYPE, HEAD, BODY, DOCUMENT_ELEMENT, NODE_TYPE, PARENT_NODE, OWNER, TAG_NAME, PARSER_OPTIONS, spacesRE, nodeTypes, selfClosingTags};

export function setupDocument( document )
{
	var firstElementPosition = -1,
		documentElementPosition = -1,
		documentTagName = "HTML";
	
	if ( document[DOCTYPE] && document[PARSER_OPTIONS].allowCustomRootElement )
		documentTagName = document[DOCTYPE].name.toUpperCase();
	
	for ( let i = 0, l = document.childNodes.length; i < l; i++ )
		if ( document.childNodes[i].tagName === documentTagName )
		{
			documentElementPosition = i;
			
			document[NODE_TYPE] = nodeTypes.DOCUMENT_NODE;
			document[DOCUMENT_ELEMENT] = document.childNodes[i];
			document[HEAD] = document[BODY] = null;
			for ( let k = 0; k < document[DOCUMENT_ELEMENT].childNodes.length; k++ )
			{
				const node = document[DOCUMENT_ELEMENT].childNodes[k];
				
				switch ( node.tagName )
				{
					case "HEAD": document[HEAD] = node; break;
					
					case "BODY":
					case "FRAMESET":
						document[BODY] = node; break;
				}
				
				if ( document[HEAD] && document[BODY] ) break;
			}
			
			if ( firstElementPosition !== -1 )
			{
				const newParent = document[HEAD] || document[BODY] || document[DOCUMENT_ELEMENT],
					count = documentElementPosition - firstElementPosition;
				for ( let k = firstElementPosition; k < documentElementPosition; k++ )
					setNodeParent( document.childNodes[k], newParent );
				newParent.childNodes.splice( 0, 0, ...document.childNodes.splice( firstElementPosition, count ) );
				documentElementPosition -= count;
				l -= count;
			}
			
			if ( documentElementPosition < l - 1 )
			{
				const newParent = document[BODY] || document[HEAD] || document[DOCUMENT_ELEMENT];
				for ( let k = documentElementPosition + 1; k < l; k++ )
					setNodeParent( document.childNodes[k], newParent );
				newParent.childNodes.splice( newParent.childNodes.length, 0, ...document.childNodes.splice( documentElementPosition + 1 ) );
			}
			
			break;
		}
		else if ( firstElementPosition === -1 && document.childNodes[i].nodeType === nodeTypes.ELEMENT_NODE )
			firstElementPosition = i;
}

export function getDocument( node )
{
	const owner = node[OWNER] || node.getRootNode();
	if ( owner[NODE_TYPE] === nodeTypes.DOCUMENT_NODE || owner[NODE_TYPE] === nodeTypes.DOCUMENT_FRAGMENT_NODE )
		return owner;
	return null;
}

export function detachNodes( nodes )
{
	if ( nodes && nodes.length > 0 ) for ( let i = 0; i < nodes.length; i++ )
		setNodeParent( nodes[i], null );
}

export function setNodeParent( node, parent )
{
	const owner = (parent !== null ? getDocument( parent ) : null);
	
	if ( node[OWNER] !== owner && node.hasChildNodes() )
		node.forEach( node => {node[OWNER] = owner}, null );
	
	node[PARENT_NODE] = parent;
	node[OWNER] = owner;
}

export function globalizeRegExp( re )
{
	if ( !re.global )
	{
		let flags = re.flags;
	/* @START_BROWSER_ONLY */
		if ( flags === undefined )
			flags = re.toString().match( reFlagsRE )[0];
	/* @END_BROWSER_ONLY */
		re = new RegExp( re.source, flags +"g" );
	}
	return re;
}