import Node from "./node.js"
import {NODE_TYPE, TAG_NAME, PARENT_NODE} from "./utils.js"

const multipleSpacesRE = /\s+/g;

// Don't touch the whitespace inside these elements.
const skipElements = split( "SCRIPT|STYLE|PRE|TEXTAREA" );

// Whitespace is allowed directly before and after these elements.
// Based on the list of inline elements at:
// https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
// Excluding elements that are not by default used for showing text
// inline with paragraph text, plus a few older ones that are.
const aroundElements = split( "A|ABBR|ACRONYM|AUDIO|B|BDI|BDO|BIG|BUTTON|CITE|CODE|DATA|DEL|DFN|EM|FONT|I|IMG|INPUT|INS|KBD|LABEL|MARK|MATH|METER|NOBR|NOSCRIPT|OBJECT|OUTPUT|PICTURE|PROGRESS|Q|RP|RT|RTC|RUBY|S|SAMP|SELECT|SLOT|SMALL|SPAN|STRIKE|STRONG|SUB|SUP|SVG|TEXTAREA|TIME|TT|U|VAR|VIDEO|WBR" );

// The elements that are allowed to contain leading and trailing spaces.
const insideElements = split( "A|ABBR|ACRONYM|B|BIG|DEL|EM|FONT|I|INS|KBD|LABEL|MARK|NOBR|RP|S|SAMP|SMALL|SPAN|STRIKE|STRONG|SUB|SUP|TIME|TT|U|VAR" );

function split( str )
{
	const arr = str.split( "|" );
	arr.forEach( elem => arr[elem] = true );
	return arr;
}

export function minifyWhitespace( base, inlineElements, transforms, userValue )
{
	const list = [];
	
	inlineElements.forEach( elem => inlineElements[String( elem ).toUpperCase()] = true );
	
	if ( transforms && transforms.inlineStyles instanceof Function )
		base.forEach( node =>
		{
			if ( node.hasAttribute( "style" ) )
			{
				const style = transforms.inlineStyles( node, node.getAttribute( "style" ), userValue );
				if ( style != null )
					node.setAttribute( "style", style );
				else node.removeAttribute( "style" );
			}
		} );
	
	const elementsToRemove = [];
	
	base.forEach( ( node, parent ) =>
	{
		if ( parent[TAG_NAME] === "STYLE" )
		{
			if ( transforms && transforms.style instanceof Function )
			{
				const style = transforms.style( node, node.nodeValue, userValue );
				if ( style != null )
					node.nodeValue = style;
				else elementsToRemove.push( parent );
			}
			return;
		}
		else if ( parent[TAG_NAME] === "SCRIPT" )
		{
			if ( transforms && transforms.script instanceof Function )
			{
				const script = transforms.script( node, node.nodeValue, userValue );
				if ( script != null )
					node.nodeValue = script;
				else elementsToRemove.push( parent );
			}
			return;
		}
		
		if ( skipElements[parent[TAG_NAME]] === true )
			return;
		
		node.nodeValue = node.nodeValue.replace( multipleSpacesRE, " " );
		list.push( node );
	}, Node.TEXT_NODE );
	
	elementsToRemove.forEach( element => element.remove() );
	
	let prevItem;
	for ( let i = 0, l = list.length - 1; i <= l; i++ )
	{
		const item = list[i];
		const parentNode = item[PARENT_NODE];
		let prevNode = item.previousSibling;
		let nextNode = item.nextSibling;
		let value = item.nodeValue;
		
		while ( prevNode && (prevNode[NODE_TYPE] === Node.COMMENT_NODE || prevNode[NODE_TYPE] === Node.TEXT_NODE || prevNode[NODE_TYPE] === Node.CDATA_SECTION_NODE || prevNode[NODE_TYPE] === Node.PROCESSING_INSTRUCTION_NODE) )
		{
			// Never go back past the previous text node, we just
			// have to settle for what we have now.
			if ( prevNode.previousSibling === prevItem ) break;
			prevNode = prevNode.previousSibling;
		}
		while ( nextNode && (nextNode[NODE_TYPE] === Node.COMMENT_NODE || nextNode[NODE_TYPE] === Node.TEXT_NODE || nextNode[NODE_TYPE] === Node.CDATA_SECTION_NODE || nextNode[NODE_TYPE] === Node.PROCESSING_INSTRUCTION_NODE) )
			nextNode = nextNode.nextSibling;
		
		if ( !insideElements[parentNode[TAG_NAME]] )
		{
			if ( prevNode == null )
				value = value.trimStart();
			if ( value !== "" && nextNode == null )
				value = value.trimEnd();
		}
		
		const isPrevNodeABlock = isBlockElement( prevNode, inlineElements );
		const isNextNodeABlock = isBlockElement( nextNode, inlineElements );
		
		if ( isPrevNodeABlock ||
			 (!prevItem &&
				(prevNode && containsBlockElementBeforeText( prevNode, inlineElements ))) ||
			 (prevItem &&
				(parentNode !== prevItem[PARENT_NODE] ||
					(prevNode && containsBlockElementBeforeText( prevNode, inlineElements ))) &&
				(isInlineDescendantOf( prevItem, prevNode, inlineElements ) ||
					isInlineDescendantOf( item, prevItem[PARENT_NODE], inlineElements )) &&
				prevItem.nodeValue.endsWith( " " )) )
			value = value.trimStart();
		
		const nextParentSibling = parentNode.nextSibling;
		
		if ( isNextNodeABlock ||
			 (!nextNode && (
			 	!nextParentSibling ||
				(nextParentSibling[NODE_TYPE] === Node.TEXT_NODE &&
					nextParentSibling.nodeValue.startsWith( " " )) ||
				isBlockElement( nextParentSibling, inlineElements ))) ||
			 (nextNode && containsBlockElementBeforeText( nextNode, inlineElements )) )
			value = value.trimEnd();
		
		if ( value === "" || (value === " " && (isPrevNodeABlock || isNextNodeABlock)) )
		{
			item.remove();
			list[i] = null;
			prevItem = null;
		}
		else
		{
			item.nodeValue = value;
			prevItem = item;
		}
	}
}

function isBlockElement( node, inlineElements )
{
	return node && !(aroundElements[node[TAG_NAME]] || inlineElements[node[TAG_NAME]]);
}

function containsBlockElementBeforeText( node, inlineElements )
{
	let block = null;
	if ( !node.childNodes || node.childNodes.length === 0 ) return false;
	node.forEach( node =>
	{
		if ( node[NODE_TYPE] === Node.TEXT_NODE ) return false; // Found text before a block.
		else if ( node[NODE_TYPE] !== Node.ELEMENT_NODE ) return; // continue
		else if ( isBlockElement( node, inlineElements ) )
		{
			block = node;
			return false; // Exit forEach() once finding a block element.
		}
	}, null );
	return (block != null);
}

function isInlineDescendantOf( node, parent, inlineElements )
{
	if ( !parent ) return false;
	while ( node )
	{
		if ( node[PARENT_NODE] === parent )
			return true;
		node = node[PARENT_NODE];
		if ( isBlockElement( node, inlineElements ) )
			break;
	}
	return false;
}