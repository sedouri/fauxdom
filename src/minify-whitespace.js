import Node from "./node.js"

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
		base.forEach( ( node, _parent ) =>
		{
			if ( node.hasAttribute( "style" ) )
			{
				const style = transforms.inlineStyles( node, node.getAttribute( "style" ), userValue );
				if ( style != null )
					node.setAttribute( "style", style );
				else node.removeAttribute( "style" );
			}
		}, Node.ELEMENT_NODE );
	
	const elementsToRemove = [];
	
	base.forEach( ( node, parent ) =>
	{
		if ( parent.tagName === "STYLE" )
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
		else if ( parent.tagName === "SCRIPT" )
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
		
		if ( skipElements[parent.tagName] === true )
			return;
		
		node.nodeValue = node.nodeValue.replace( multipleSpacesRE, " " );
		list.push( node );
	}, Node.TEXT_NODE );
	
	elementsToRemove.forEach( element => element.remove() );
	
	let prevItem;
	for ( let i = 0, l = list.length - 1; i <= l; i++ )
	{
		const item = list[i];
		let prevNode = item.previousSibling,
			nextNode = item.nextSibling,
			value = item.nodeValue;
		
		while ( prevNode && (prevNode.nodeType === Node.COMMENT_NODE || prevNode.nodeType === Node.TEXT_NODE) )
			prevNode = prevNode.previousSibling;
		while ( nextNode && (nextNode.nodeType === Node.COMMENT_NODE || nextNode.nodeType === Node.TEXT_NODE) )
			nextNode = nextNode.nextSibling;
		
		if ( !insideElements[item.parentNode.tagName] )
		{
			if ( prevNode == null )
				value = value.trimStart();
			if ( value !== "" && nextNode == null )
				value = value.trimEnd();
		}
		
		const isPrevNodeABlock = (prevNode && !(aroundElements[prevNode.tagName] || inlineElements[prevNode.tagName]));
		const isNextNodeABlock = (nextNode && !(aroundElements[nextNode.tagName] || inlineElements[nextNode.tagName]));
		
		if ( isPrevNodeABlock ||
			 (prevItem && !(aroundElements[item.tagName] || inlineElements[item.tagName]) && prevItem.nodeValue.endsWith( " " )) )
			value = value.trimStart();
		
		if ( isNextNodeABlock ||
			 (!nextNode && (!item.parentNode.nextSibling ||
				(item.parentNode.nextSibling.nodeType === Node.TEXT_NODE && item.parentNode.nextSibling.nodeValue.startsWith( " " )))) )
			value = value.trimEnd();
		
		if ( value === "" || (value === " " && (isPrevNodeABlock || isNextNodeABlock)) )
		{
			item.remove();
			list[i] = null;
		}
		else item.nodeValue = value;
		
		prevItem = item;
	}
}