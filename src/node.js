import DOM from "./document.js";
import Parser from "./html-parser.js";
import {createTokenList} from "./token-list.js";
import {querySelector, closest, matches} from "./selectors.js";
import {serializeNode} from "./serializer.js";
import {DOCTYPE, HEAD, BODY, NODE_TYPE, PARENT_NODE, OWNER, TAG_NAME, PARSER_OPTIONS,
	spacesRE, nodeTypes, selfClosingTags, setupDocument, getDocument, detachNodes, setNodeParent} from "./utils.js";

const CLASS_LIST = Symbol( "classList" );

export function createNode( nodeType, baseClass = Node )
{
	const node = Object.create( baseClass.prototype );
	
	node[NODE_TYPE] = nodeType;
	node.nodeValue = null;
	node[PARENT_NODE] = null;
	node[OWNER] = null;
	
	switch ( nodeType )
	{
		case Node.ELEMENT_NODE:
			node[TAG_NAME] = null;
			node.attributes = {};
			// fallthrough
			
		case Node.DOCUMENT_NODE:
		case Node.DOCUMENT_FRAGMENT_NODE:
			node.childNodes = [];
	}
	
	return node;
}

export default class Node
{
	constructor()
	{
		throw new Error( "Cannot directly instantiate Node." );
	}
	
	get nodeType() {return this[NODE_TYPE]}
	
	get nodeName()
	{
		switch ( this.nodeType )
		{
			case Node.ELEMENT_NODE: return this.tagName;
			case Node.TEXT_NODE: return "#text";
			case Node.CDATA_SECTION_NODE: return "#cdata-section";
			case Node.PROCESSING_INSTRUCTION_NODE: return this.target;
			case Node.COMMENT_NODE: return "#comment";
			case Node.DOCUMENT_NODE: return "#document";
			case Node.DOCUMENT_TYPE_NODE: return this.name;
			case Node.DOCUMENT_FRAGMENT_NODE: return "#document-fragment";
		}
	}
	
	get parentNode() {return this[PARENT_NODE]}
	get ownerDocument() {return this[OWNER]}
	get tagName() {return this[TAG_NAME] || null}
	
	get firstChild()
	{
		if ( this.childNodes ) return this.childNodes[0] || null;
		return null;
	}
	
	get lastChild()
	{
		if ( this.childNodes ) return this.childNodes[this.childNodes.length - 1] || null;
		return null;
	}
	
	get previousSibling()
	{
		const parent = this.parentNode;
		if ( parent )
		{
			const idx = parent.childNodes.indexOf( this );
			if ( idx > 0 ) return parent.childNodes[idx - 1];
		}
		return null;
	}
	
	get nextSibling()
	{
		const parent = this.parentNode;
		if ( parent )
		{
			const idx = parent.childNodes.indexOf( this );
			if ( idx > -1 && idx < parent.childNodes.length - 1 ) return parent.childNodes[idx + 1];
		}
		return null;
	}
	
	get id()
	{
		return (this.attributes && this.attributes.id) || "";
	}
	set id( id )
	{
		if ( this.attributes )
			this.attributes.id = id;
	}
	
	get className()
	{
		return (this.attributes && this.attributes.class) || "";
	}
	set className( val )
	{
		if ( this.attributes )
		{
			this.classList.value = val;
			this.attributes.class = this[CLASS_LIST].value;
		}
	}
	
	get classList()
	{
		if ( this.attributes )
		{
			if ( !this[CLASS_LIST] )
				this[CLASS_LIST] = createTokenList( this );
			return this[CLASS_LIST];
		}
		return null;
	}
	
	get innerHTML()
	{
		if ( this.nodeType === Node.ELEMENT_NODE )
		{
			let html = "";
			for ( let i = 0; i < this.childNodes.length; i++ )
				html += serializeNode( this.childNodes[i] );
			return html;
		}
		return null;
	}
	set innerHTML( html )
	{
		if ( this.nodeType === Node.ELEMENT_NODE && selfClosingTags[this.tagName] !== true )
		{
			const nodes = parseHTML( this, html );
			if ( nodes )
				addChildNode( this, nodes, 0, this.childNodes.length );
			else
			{
				detachNodes( this.childNodes );
				this.childNodes.length = 0;
			}
		}
	}
	
	get outerHTML()
	{
		return serializeNode( this );
	}
	set outerHTML( html )
	{
		if ( this.parentNode )
		{
			const idx = this.parentNode.childNodes.indexOf( this ),
				nodes = parseHTML( this, html );
			if ( nodes )
				addChildNode( this.parentNode, nodes, idx, 1 );
			else detachNodes( this.parentNode.childNodes.splice( idx, 1 ) );
		}
	}
	
	get textContent()
	{
		if ( this.childNodes )
		{
			let text = "";
			for ( let i = 0; i < this.childNodes.length; i++ )
			{
				if ( this.childNodes[i].nodeType !== Node.COMMENT_NODE &&
						this.childNodes[i].nodeType !== Node.CDATA_SECTION_NODE &&
						this.childNodes[i].nodeType !== Node.PROCESSING_INSTRUCTION_NODE )
					text += this.childNodes[i].textContent;
			}
			return text;
		}
		return this.nodeValue;
	}
	set textContent( text )
	{
		if ( text == null )
			text = "";
		else if ( typeof text !== "string" )
			text += "";
		
		if ( this.childNodes )
		{
			let node = createNode( Node.TEXT_NODE );
			node.nodeValue = text;
			setNodeParent( node, this );
			
			detachNodes( this.childNodes );
			this.childNodes.length = 1;
			this.childNodes[0] = node;
		}
		else if ( this.nodeType >= Node.TEXT_NODE && this.nodeType <= Node.COMMENT_NODE )
			this.nodeValue = text;
	}
	
	getRootNode()
	{
		let rootNode = this;
		while ( rootNode.parentNode )
			rootNode = rootNode.parentNode;
		return rootNode;
	}
	
	hasAttributes()
	{
		if ( this.attributes ) for ( let k in this.attributes )
			if ( this.attributes.hasOwnProperty( k ) ) return true;
		return false;
	}
	
	getAttributeNames()
	{
		if ( this.attributes )
			return Object.keys( this.attributes );
		return [];
	}
	
	getAttribute( name )
	{
		var result;
		if ( this.attributes && name && typeof name === "string" )
			result = this.attributes[lowerAttributeCase( this, name )];
		if ( result === undefined )
			return null;
		return result;
	}
	
	setAttribute( name, value )
	{
		if ( this.attributes && name && typeof name === "string" )
		{
			name = lowerAttributeCase( this, name );
			if ( name === "class" )
			{
				if ( value !== true )
					this.className = ""+ value;
				else
				{
					this.classList.value = "";
					this.attributes[name] = true;
				}
			}
			else if ( typeof value === "string" || value === true )
				this.attributes[name] = value;
			else this.attributes[name] = ""+ value;
		}
	}
	
	toggleAttribute( name, force )
	{
		if ( this.attributes && name && typeof name === "string" )
		{
			name = lowerAttributeCase( this, name );
			if ( !this.attributes.hasOwnProperty( name ) )
			{
				if ( arguments.length === 1 || force === true )
					return (this.attributes[name] = true);
				return false;
			}
			else if ( arguments.length === 1 || force === false )
			{
				delete this.attributes[name];
				return false;
			}
			return true;
		}
	}
	
	removeAttribute( name )
	{
		if ( this.attributes && name && typeof name === "string" )
		{
			name = lowerAttributeCase( this, name );
			if ( name === "class" && this[CLASS_LIST] )
				this[CLASS_LIST].value = null;
			delete this.attributes[name];
		}
	}
	
	hasAttribute( name )
	{
		if ( this.attributes && name && typeof name === "string" )
			return this.attributes.hasOwnProperty( lowerAttributeCase( this, name ) );
		return false;
	}
	
	hasChildNodes()
	{
		return (!!this.childNodes && this.childNodes.length > 0);
	}
	
	appendChild( child )
	{
		return this.insertBefore( child, null );
	}
	
	insertBefore( newChild, refChild )
	{
		if ( this.childNodes && newChild instanceof Node && arguments.length > 1 )
		{
			let idx = -1;
			
			if ( refChild == null )
				idx = this.childNodes.length;
			else if ( refChild instanceof Node && refChild.parentNode === this )
				idx = this.childNodes.indexOf( refChild );
			
			if ( idx !== -1 )
				return addChildNode( this, newChild, idx );
		}
		return null;
	}
	
	replaceChild( newChild, oldChild )
	{
		if ( this.childNodes && oldChild instanceof Node && newChild instanceof Node &&
			oldChild.parentNode === this && oldChild !== newChild )
		{
			addChildNode( this, newChild, this.childNodes.indexOf( oldChild ), 1 );
			return oldChild;
		}
		return null;
	}
	
	removeChild( child )
	{
		if ( this.childNodes && child instanceof Node && child.parentNode === this )
		{
			const idx = this.childNodes.indexOf( child ),
				owner = getDocument( this );
			
			if ( owner && child.parentNode === owner.documentElement && tagNameProp.hasOwnProperty( child.tagName ) )
				owner[tagNameProp[child.tagName]] = null;
			
			detachNodes( this.childNodes.splice( idx, 1 ) );
			return child;
		}
		return null;
	}
	
	cloneNode( deep )
	{
		var clone;
		
		if ( this.nodeType === Node.DOCUMENT_NODE || this.nodeType === Node.DOCUMENT_FRAGMENT_NODE )
			clone = new DOM( null, this[PARSER_OPTIONS] );
		else clone = createNode( this.nodeType );
		
		switch ( this.nodeType )
		{
			case Node.ELEMENT_NODE:
				clone[TAG_NAME] = this.tagName;
				clone.attributes = Object.assign( clone.attributes, this.attributes );
				break;
				
			case Node.TEXT_NODE:
			case Node.CDATA_SECTION_NODE:
			case Node.PROCESSING_INSTRUCTION_NODE:
			case Node.COMMENT_NODE:
				clone.nodeValue = this.nodeValue;
				break;
				
			case Node.DOCUMENT_NODE:
			case Node.DOCUMENT_FRAGMENT_NODE:
				clone[NODE_TYPE] = this.nodeType;
				clone.entityEncoder.entities = this.entityEncoder;
				break;
				
			case Node.DOCUMENT_TYPE_NODE:
				clone.name = this.name;
				clone.publicId = this.publicId;
				clone.systemId = this.systemId;
				break;
		}
		
		if ( deep === true && this.childNodes && this.childNodes.length > 0 )
		{
			for ( let i = 0; i < this.childNodes.length; i++ )
				clone.appendChild( this.childNodes[i].cloneNode( true ) );
			
			if ( clone.nodeType === Node.DOCUMENT_NODE || clone.nodeType === Node.DOCUMENT_FRAGMENT_NODE )
				setupDocument( clone );
		}
		
		return clone;
	}
	
	getElementById( id )
	{
		var elem = null;
		if ( id && typeof id === "string" && this.childNodes )
			this.forEach( node =>
			{
				if ( node.id === id )
				{
					elem = node;
					return false;
				}
			} );
		return elem;
	}
	
	getElementsByClassName( className )
	{
		var nodeList = [];
		if ( className && typeof className === "string" )
		{
			const classList = className.trim().split( spacesRE );
			if ( classList.length > 1 || classList[0] !== "" ) this.forEach( node =>
			{
				for ( let i = 0; i < classList.length; i++ )
					if ( !node.classList.contains( classList[i] ) )
						return;
				nodeList.push( node );
			} );
		}
		return nodeList;
	}
	
	getElementsByTagName( tagName )
	{
		var nodeList = [];
		if ( tagName && typeof tagName === "string" )
		{
			tagName = tagName.toUpperCase();
			this.forEach( node =>
			{
				if ( tagName === "*" || node.tagName === tagName )
					nodeList.push( node );
			} );
		}
		return nodeList;
	}
	
	closest( selector )
	{
		if ( selector && typeof selector === "string" )
			return closest( this, selector );
		else return null;
	}
	
	matches( selector )
	{
		if ( selector && typeof selector === "string" )
			return matches( this, selector );
		else return false;
	}
	
	querySelector( selector )
	{
		if ( selector && typeof selector === "string" )
			return querySelector( this, selector, false );
		else return null;
	}
	
	querySelectorAll( selector )
	{
		if ( selector && typeof selector === "string" )
			return querySelector( this, selector, true );
		else return [];
	}
	
	// Non-standard
	
	forEach( callback, type = nodeTypes.ELEMENT_NODE )
	{
		// This unrolled recursive function is about 1.45x faster in Node than its
		// equivalent recursive form.
		
		let childNodes = this.childNodes,
			current = this.firstChild,
			idxStack = [],
			idx = 0,
			parent, nextSibling;
		
		while ( current )
		{
			// 'parent' and 'nextSibling' are stored here so that if callback() changes
			// the document, we can maintain our place in the overall list of nodes by
			// looking for insertions, deletions, or replacements within the 'current'
			// node's list of siblings.
			parent = current[PARENT_NODE];
			nextSibling = childNodes[idx + 1];
			
			if ( (type === null || current.nodeType === type) &&
				callback( current, parent ) === false )
					return;
			
			// If the parent of 'current' changes during callback(), we no longer want to
			// look at the children of 'current' here as it was either moved or removed.
			if ( current[PARENT_NODE] === parent && current.childNodes && current.childNodes.length > 0 )
			{
				idxStack.push( idx );
				childNodes = current.childNodes;
				current = childNodes[idx = 0];
			}
			else
			{
				if ( nextSibling )
				{
					idx += 1;
					// If callback() changed the number of nodes that come before the
					// previously found 'nextSibling', 'idx' needs to be updated so we
					// don't skip over or repeat visits to any nodes.
					if ( nextSibling !== childNodes[idx] )
						idx = parent.childNodes.indexOf( nextSibling );
				}
				else idx = childNodes.length;
				
				while ( childNodes[idx] == null )
				{
					current = parent;
					parent = current[PARENT_NODE];
					if ( current && current !== this )
					{
						childNodes = parent.childNodes;
						idx = idxStack.pop() + 1;
					}
					else return;
				}
				current = childNodes[idx];
			}
		}
	}
}

Object.defineProperties( Node,
{
	ELEMENT_NODE: {value: nodeTypes.ELEMENT_NODE},
	//ATTRIBUTE_NODE: {value: nodeTypes.ATTRIBUTE_NODE},
	TEXT_NODE: {value: nodeTypes.TEXT_NODE},
	CDATA_SECTION_NODE: {value: nodeTypes.CDATA_SECTION_NODE},
	//ENTITY_REFERENCE_NODE: {value: nodeTypes.ENTITY_REFERENCE_NODE},
	//ENTITY_NODE: {value: nodeTypes.ENTITY_NODE},
	PROCESSING_INSTRUCTION_NODE: {value: nodeTypes.PROCESSING_INSTRUCTION_NODE},
	COMMENT_NODE: {value: nodeTypes.COMMENT_NODE},
	DOCUMENT_NODE: {value: nodeTypes.DOCUMENT_NODE},
	DOCUMENT_TYPE_NODE: {value: nodeTypes.DOCUMENT_TYPE_NODE},
	DOCUMENT_FRAGMENT_NODE: {value: nodeTypes.DOCUMENT_FRAGMENT_NODE},
	//NOTATION_NODE: {value: nodeTypes.NOTATION_NODE},
} );

const tagNameProp = {
	HEAD,
	BODY,
	FRAMESET: BODY
};

function addChildNode( parent, node, index, removalCount = 0 )
{
	if ( !parent ||
		(parent.nodeType !== Node.ELEMENT_NODE &&
	 		parent.nodeType !== Node.DOCUMENT_NODE &&
	 		parent.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) ||
		(parent.nodeType === Node.ELEMENT_NODE && selfClosingTags[parent.tagName] === true) )
			return node;
	
	if ( node.nodeType <= Node.COMMENT_NODE )
	{
		if ( parent.parentNode && parent.parentNode.nodeType === Node.DOCUMENT_NODE )
		{
			if ( tagNameProp.hasOwnProperty( node.tagName ) )
			{
				const prop = tagNameProp[node.tagName];
				if ( parent.parentNode[prop] && removalCount === 0 )
					return node;
				parent.parentNode[prop] = node;
			}
		}
		
		if ( node.parentNode )
			node.parentNode.removeChild( node );
		setNodeParent( node, parent );
		detachNodes( parent.childNodes.splice( index, removalCount, node ) );
	}
	else if ( node.nodeType === Node.DOCUMENT_TYPE_NODE &&
		(parent.nodeType === Node.DOCUMENT_NODE || parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) )
	{
		const owner = node.parentNode;
		if ( owner && (owner.nodeType === Node.DOCUMENT_NODE || owner.nodeType === Node.DOCUMENT_FRAGMENT_NODE) )
		{
			owner.removeChild( node );
			owner[DOCTYPE] = null;
		}
		setNodeParent( node, parent );
		detachNodes( parent.childNodes.splice( index, removalCount, node ) );
		parent[DOCTYPE] = node;
	}
	else if ( node.nodeType === Node.DOCUMENT_FRAGMENT_NODE )
	{
		if ( parent.parentNode && parent.parentNode.nodeType === Node.DOCUMENT_NODE )
		{
			if ( removalCount > 0 )
				detachNodes( parent.childNodes.splice( index, removalCount ) );
			for ( let i = node.childNodes.length - 1; i >= 0; i-- )
			{
				const child = node.childNodes[i];
				if ( tagNameProp.hasOwnProperty( child.tagName ) )
				{
					const prop = tagNameProp[child.tagName];
					if ( parent.parentNode[prop] && removalCount === 0 )
						continue;
					parent.parentNode[prop] = child;
				}
				setNodeParent( child, parent );
				parent.childNodes.splice( index, 0, child );
				node.childNodes.splice( i, 1 );
			}
		}
		else if ( node !== getDocument( parent ) )
		{
			for ( let i = 0; i < node.childNodes.length; i++ )
				setNodeParent( node.childNodes[i], parent );
			detachNodes( parent.childNodes.splice( index, removalCount, ...node.childNodes ) );
			node.childNodes.length = 0;
		}
	}
	
	return node;
}

function parseHTML( parent, html )
{
	if ( html && typeof html === "string" )
	{
		const owner = getDocument( parent );
		return new Parser( html, owner ? owner[PARSER_OPTIONS] : null, owner ? owner.entityEncoder : null ).parseHTML();
	}
}

function lowerAttributeCase( node, name )
{
	const owner = getDocument( node );
	if ( owner && owner[PARSER_OPTIONS].lowerAttributeCase )
		return name.toLowerCase();
	return name;
}