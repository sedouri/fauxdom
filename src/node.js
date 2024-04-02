import DOM from "./document.js"
import Parser from "./html-parser.js"
import {createTokenList} from "./token-list.js"
import {querySelector, closest, matches} from "./selectors.js"
import {serializeNode} from "./serializer.js"
import {DOCTYPE, NODE_TYPE, PARENT_NODE, OWNER, TAG_NAME, PARSER_OPTIONS,
	spacesRE, tagNameProp, nodeTypes, selfClosingTags, setupDocument, getDocument, detachNodes, setNodeParent} from "./utils.js"

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

function createTextNode( text )
{
	const node = createNode( Node.TEXT_NODE );
	node.nodeValue = text;
	return node;
}

export default class Node
{
	constructor()
	{
		throw new Error( "Cannot directly instantiate Node." );
	}
	
	get nodeType() {return this[NODE_TYPE]}
	
	// deno-lint-ignore getter-return
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
		const parent = this[PARENT_NODE];
		if ( parent )
		{
			const idx = parent.childNodes.indexOf( this );
			if ( idx > 0 ) return parent.childNodes[idx - 1];
		}
		return null;
	}
	
	get nextSibling()
	{
		const parent = this[PARENT_NODE];
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
		if ( this[PARENT_NODE] )
		{
			const idx = this[PARENT_NODE].childNodes.indexOf( this ),
				nodes = parseHTML( this, html );
			if ( nodes )
				addChildNode( this[PARENT_NODE], nodes, idx, 1 );
			else detachNodes( this[PARENT_NODE].childNodes.splice( idx, 1 ) );
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
			const node = createTextNode( text );
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
		// deno-lint-ignore no-this-alias
		let rootNode = this;
		while ( rootNode[PARENT_NODE] )
			rootNode = rootNode[PARENT_NODE];
		return rootNode;
	}
	
	hasAttributes()
	{
		if ( this.attributes ) for ( const key in this.attributes )
			if ( Object.hasOwn( this.attributes, key ) ) return true;
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
		let result;
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
			if ( !Object.hasOwn( this.attributes, name ) )
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
			return Object.hasOwn( this.attributes, lowerAttributeCase( this, name ) );
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
			else if ( refChild instanceof Node && refChild[PARENT_NODE] === this )
				idx = this.childNodes.indexOf( refChild );
			
			if ( idx !== -1 )
				return addChildNode( this, newChild, idx );
		}
		return null;
	}
	
	replaceChild( newChild, oldChild )
	{
		if ( this.childNodes && oldChild instanceof Node && newChild instanceof Node &&
			oldChild[PARENT_NODE] === this && oldChild !== newChild )
		{
			addChildNode( this, newChild, this.childNodes.indexOf( oldChild ), 1 );
			return oldChild;
		}
		return null;
	}
	
	removeChild( child )
	{
		if ( this.childNodes && child instanceof Node && child[PARENT_NODE] === this )
		{
			detachNodes( this.childNodes.splice( this.childNodes.indexOf( child ), 1 ) );
			return child;
		}
		return null;
	}
	
	prepend( ...nodes )
	{
		if ( !this.childNodes || nodes.length === 0 ) return;
		
		let idx = 0;
		if ( this === getDocument( this ) && this[DOCTYPE] )
			idx = this.childNodes.indexOf( this[DOCTYPE] ) + 1;
		
		insertNodes( this, nodes, idx );
	}
	
	append( ...nodes )
	{
		if ( !this.childNodes || nodes.length === 0 ) return;
		
		insertNodes( this, nodes, this.childNodes.length );
	}
	
	replaceChildren( ...nodes )
	{
		if ( !this.childNodes ) return;
		
		detachNodes( this.childNodes );
		this.childNodes.length = 0;
		
		if ( nodes.length > 0 )
			insertNodes( this, nodes, 0 );
	}
	
	before( ...nodes )
	{
		if ( this[NODE_TYPE] === Node.DOCUMENT_TYPE_NODE )
			return this.after( ...nodes );
		
		const parent = this[PARENT_NODE];
		if ( parent )
		{
			const idx = parent.childNodes.indexOf( this );
			insertNodes( parent, nodes, idx );
		}
	}
	
	after( ...nodes )
	{
		const parent = this[PARENT_NODE];
		if ( parent )
		{
			const idx = parent.childNodes.indexOf( this ) + 1;
			insertNodes( parent, nodes, idx );
		}
	}
	
	replaceWith( ...nodes )
	{
		const parent = this[PARENT_NODE];
		if ( parent )
		{
			const idx = parent.childNodes.indexOf( this );
			detachNodes( parent.childNodes.splice( idx, 1 ) );
			insertNodes( parent, nodes, idx );
		}
	}
	
	remove()
	{
		this[PARENT_NODE] && this[PARENT_NODE].removeChild( this );
	}
	
	cloneNode( deep )
	{
		let clone;
		
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
		let elem = null;
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
		const nodeList = [];
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
		const nodeList = [];
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
		
		let childNodes = this.childNodes;
		let current = this.firstChild;
		const idxStack = [];
		//const elementStack = [];
		let idx = 0;
		let parent;
		let nextSibling;
		
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
				//elementStack.push( nextSibling );
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
						//nextSibling = elementStack.pop();
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

function addChildNode( parent, node, index, removalCount = 0 )
{
	if ( !parent ||
		(parent[NODE_TYPE] !== Node.ELEMENT_NODE &&
	 		parent[NODE_TYPE] !== Node.DOCUMENT_NODE &&
	 		parent[NODE_TYPE] !== Node.DOCUMENT_FRAGMENT_NODE) ||
		(parent[NODE_TYPE] === Node.ELEMENT_NODE && selfClosingTags[parent.tagName] === true) )
			return node;
	
	const elementsToReplace = parent.childNodes.slice( index, index + removalCount );
	
	// If we're adding a document fragment that has a single child node, then pull that node out and
	// just insert it for simplicity.
	if ( node[NODE_TYPE] === Node.DOCUMENT_FRAGMENT_NODE && node.childNodes.length === 1 )
		node = node.childNodes[0];
	
	// Inserting a single node.
	if ( node[NODE_TYPE] <= Node.COMMENT_NODE )
	{
		// Disallow parent nodes from being added to their child nodes.
		if ( parent[PARENT_NODE] )
		{
			const doc = getDocument( parent );
			for ( let p = parent; p && p !== doc; p = p[PARENT_NODE])
				if ( p === node )
					return node;
		}
		
		// Check for duplicate head, body, or frameset node insertion into the root document node.
		const superParent = parent[PARENT_NODE];
		if ( superParent && superParent[NODE_TYPE] === Node.DOCUMENT_NODE && Object.hasOwn( tagNameProp, node.tagName ) )
		{
			const currentElement = superParent[tagNameProp[node.tagName]];
			if ( currentElement && elementsToReplace.indexOf( currentElement ) === -1 )
				return node;
		}
		
		// The node must be removed from its original parent/position before it can be moved.
		if ( node[PARENT_NODE] )
			node[PARENT_NODE].removeChild( node );
		
		detachNodes( parent.childNodes.splice( index, removalCount, node ) );
		setNodeParent( node, parent );
	}
	
	// Inserting a DOCTYPE node into a document or document fragment.
	else if ( node[NODE_TYPE] === Node.DOCUMENT_TYPE_NODE &&
		(parent[NODE_TYPE] === Node.DOCUMENT_NODE || parent[NODE_TYPE] === Node.DOCUMENT_FRAGMENT_NODE) )
	{
		// Check for duplicate DOCTYPE node insertion.
		if ( parent[DOCTYPE] && elementsToReplace.indexOf( parent[DOCTYPE] ) === -1 )
			return node;
		
		// Remove the new DOCTYPE from its original parent document, if it had one.
		const owner = node[PARENT_NODE];
		if ( owner && (owner[NODE_TYPE] === Node.DOCUMENT_NODE || owner[NODE_TYPE] === Node.DOCUMENT_FRAGMENT_NODE) )
		{
			owner.removeChild( node );
			owner[DOCTYPE] = null;
		}
		
		detachNodes( parent.childNodes.splice( index, removalCount, node ) );
		setNodeParent( node, parent );
		parent[DOCTYPE] = node;
	}
	
	// Inserting a document fragment with multiple top-level nodes.
	else if ( node[NODE_TYPE] === Node.DOCUMENT_FRAGMENT_NODE )
	{
		const superParent = parent[PARENT_NODE];
		const uniqueInsertions = {};
		const elementsToInsert = [];
		
		// Inserting the fragment into the root node of a document.
		if ( superParent && superParent[NODE_TYPE] === Node.DOCUMENT_NODE )
		{
			// Inserting into the document's root node requires special handling to ensure `document.head`
			// and `document.body` are maintained properly.
			
			for ( let i = 0; i < node.childNodes.length; i++ )
			{
				const child = node.childNodes[i];
				// Ensure DOCTYPE nodes don't get inserted here.
				if ( child[NODE_TYPE] <= Node.COMMENT_NODE )
				{
					// Check for duplicate head, body, or frameset node insertion into the root document node.
					if ( Object.hasOwn( tagNameProp, child.tagName ) )
					{
						const nodeType = tagNameProp[child.tagName];
						const currentElement = superParent[nodeType];
						if ( uniqueInsertions[nodeType] || (currentElement && elementsToReplace.indexOf( currentElement ) === -1) )
							continue;
						
						// Track the insertion of head and body/frameset nodes to prevent more than one from
						// being inserted. Only the first of either will be inserted (body and frameset nodes
						// are treated as the same here, since they both set `document.body`).
						uniqueInsertions[nodeType] = true;
					}
					
					elementsToInsert.push( child );
					node.childNodes.splice( i--, 1 );
				}
			}
		}
		else
		{
			const owner = getDocument( parent );
			if ( node !== owner ) // Prevent fragments from being inserted into themselves.
				for ( let i = 0; i < node.childNodes.length; i++ )
				{
					const child = node.childNodes[i];
					if ( child[NODE_TYPE] === Node.DOCUMENT_TYPE_NODE )
					{
						// NOTE: The use of `uniqueInsertions` here is probably unnecessary since it shouldn't
						// be possible to have multiple DOCTYPE nodes at the root level of document fragments.
						// Its use here is a just-in-case measure.
						if ( uniqueInsertions[DOCTYPE] || parent !== owner || (parent[DOCTYPE] && elementsToReplace.indexOf( parent[DOCTYPE] ) === -1) )
							continue;
						uniqueInsertions[DOCTYPE] = true;
					}
					elementsToInsert.push( child );
					node.childNodes.splice( i--, 1 );
				}
		}
		
		if ( elementsToInsert && elementsToInsert.length > 0 )
		{
			detachNodes( parent.childNodes.splice( index, removalCount, ...elementsToInsert ) );
			for ( let i = 0; i < elementsToInsert.length; i++ )
				setNodeParent( elementsToInsert[i], parent );
		}
	}
	
	return node;
}

function insertNodes( parent, nodes, index )
{
	let idx = index;
	for ( let i = 0; i < nodes.length; i++ )
	{
		let node = nodes[i];
		if ( !(node instanceof Node) )
			node = createTextNode( ""+ node );
		addChildNode( parent, node, idx++ );
	}
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