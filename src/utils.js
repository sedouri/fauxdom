const DOCTYPE = Symbol( "doctype" );
const HEAD = Symbol( "head" );
const BODY = Symbol( "body" );
const DOCUMENT_ELEMENT = Symbol( "documentElement" );
const NODE_TYPE = Symbol( "nodeType" );
const PARENT_NODE = Symbol( "parentNode" );
const OWNER = Symbol( "ownerDocument" );
const TAG_NAME = Symbol( "tagName" );
const PARSER_OPTIONS = Symbol( "parserOptions" );

const spacesRE = /\s+/g;
/* @START_BROWSER_ONLY */
const reFlagsRE = /[gimsuy]*$/;
/* @END_BROWSER_ONLY */

const nodeTypes = {
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
};

const selfClosingTags = {
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

export const tagNameProp = {
	HEAD,
	BODY,
	FRAMESET: BODY
};

export {DOCTYPE, HEAD, BODY, DOCUMENT_ELEMENT, NODE_TYPE, PARENT_NODE, OWNER, TAG_NAME, PARSER_OPTIONS, spacesRE, nodeTypes, selfClosingTags};

export function setupDocument( document )
{
	let firstElementPosition = -1;
	let documentElementPosition = -1;
	let documentTagName = "HTML";
	
	if ( document[DOCTYPE] && document[PARSER_OPTIONS].allowCustomRootElement )
		documentTagName = document[DOCTYPE].name.toUpperCase();
	
	for ( let i = 0, l = document.childNodes.length; i < l; i++ )
		if ( document.childNodes[i][TAG_NAME] === documentTagName )
		{
			documentElementPosition = i;
			
			document[NODE_TYPE] = nodeTypes.DOCUMENT_NODE;
			document[DOCUMENT_ELEMENT] = document.childNodes[i];
			prepareDocument( document );
			
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

function prepareDocument( document )
{
	if ( !document || !document[DOCUMENT_ELEMENT] ) return;
	
	const children = document[DOCUMENT_ELEMENT].childNodes;
	document[HEAD] = document[BODY] = null;
	for ( let i = 0; i < children.length; i++ )
	{
		const node = children[i];
		
		switch ( node[TAG_NAME] )
		{
			case "HEAD": document[HEAD] = node; break;
			
			case "BODY":
			case "FRAMESET":
				document[BODY] = node; break;
		}
		
		if ( document[HEAD] && document[BODY] ) break;
	}
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
	if ( nodes && nodes.length > 0 )
	{
		for ( let i = 0; i < nodes.length; i++ )
		{
			const node = nodes[i];
			const owner = getDocument( node );
			
			if ( owner )
			{
				if ( node === owner[DOCTYPE] )
					owner[DOCTYPE] = null;
				else if ( node === owner[DOCUMENT_ELEMENT] )
				{
					owner[DOCUMENT_ELEMENT] = null;
					owner[HEAD] = null;
					owner[BODY] = null;
				}
				else if ( node[PARENT_NODE] === owner[DOCUMENT_ELEMENT] && Object.hasOwn( tagNameProp, node[TAG_NAME] ) )
					owner[tagNameProp[node[TAG_NAME]]] = null;
			}
			
			setNodeParent( node, null );
		}
	}
}

export function setNodeParent( node, parent )
{
	const owner = (parent !== null ? getDocument( parent ) : null);
	
	if ( parent )
	{
		if ( node[NODE_TYPE] === nodeTypes.DOCUMENT_TYPE_NODE && parent === owner )
		{
			parent[DOCTYPE] = node;
			if ( !parent[DOCUMENT_ELEMENT] )
			{
				const rootTag = node.name.toUpperCase();
				parent[DOCUMENT_ELEMENT] = parent.childNodes.find( node => node.tagName === rootTag );
			}
			prepareDocument( parent );
		}
		else if ( parent[NODE_TYPE] === nodeTypes.DOCUMENT_NODE )
		{
			const doctype = parent[DOCTYPE];
			if ( doctype && doctype.name.toUpperCase() === node[TAG_NAME] )
			{
				parent[DOCUMENT_ELEMENT] = node;
				prepareDocument( parent );
			}
		}
		else if ( parent[PARENT_NODE] && parent[PARENT_NODE][NODE_TYPE] === nodeTypes.DOCUMENT_NODE && Object.hasOwn( tagNameProp, node[TAG_NAME] ) )
			parent[PARENT_NODE][tagNameProp[node[TAG_NAME]]] = node;
	}
	
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