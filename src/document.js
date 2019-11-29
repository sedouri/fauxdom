import "./polyfills.js";

import Parser from "./html-parser.js";
import Node, {createNode} from "./node.js";
import {serializeNode} from "./serializer.js";
import EntityEncoder from "./entity-encoder.js";
import {DOCTYPE, HEAD, BODY, DOCUMENT_ELEMENT, NODE_TYPE, TAG_NAME, PARSER_OPTIONS,
	setupDocument, detachNodes, setNodeParent} from "./utils.js";

/* @START_UNIT_TESTS */
import {parseSelector} from "./selector-parser.js";
/* @END_UNIT_TESTS */

const ENTITY_ENCODER = Symbol( "entityEncoder" );

export default class DOM extends Node
{
	constructor( html, options )
	{
		const node = createNode( Node.DOCUMENT_FRAGMENT_NODE, DOM );
		node[PARSER_OPTIONS] = Parser.setupOptions( options );
		node[ENTITY_ENCODER] = new EntityEncoder( node[PARSER_OPTIONS].entities );
		node.innerHTML = html;
		return node;
	}
	
	get documentElement() {return this[DOCUMENT_ELEMENT] || null}
	
	get innerHTML()
	{
		let html = "";
		for ( let i = 0; i < this.childNodes.length; i++ )
			html += serializeNode( this.childNodes[i] );
		return html;
	}
	set innerHTML( html )
	{
		this[NODE_TYPE] = Node.DOCUMENT_FRAGMENT_NODE;
		if ( html && typeof html === "string" )
		{
			const rootNode = new Parser( html, this[PARSER_OPTIONS], this[ENTITY_ENCODER] ).parseHTML();
			
			detachNodes( this.childNodes );
			
			if ( rootNode.doctype )
				this[DOCTYPE] = rootNode.doctype;
			else this[DOCTYPE] = null;
			
			this.childNodes = rootNode.childNodes;
			for ( let i = 0; i < this.childNodes.length; i++ )
				setNodeParent( this.childNodes[i], this );
			
			setupDocument( this );
		}
		else this.childNodes.length = 0;
	}
	
	get outerHTML() {return null}
	set outerHTML( v ) {}
	
	get doctype()
	{
		return this[DOCTYPE] || null;
	}
	set doctype( val )
	{
		if ( val )
		{
			let doctype = this[DOCTYPE];
			if ( val instanceof Node )
			{
				if ( val.nodeType === Node.DOCUMENT_TYPE_NODE && val !== doctype )
				{
					this[DOCTYPE] = val;
					if ( doctype ) this.replaceChild( val, doctype );
					else this.insertBefore( val, this.firstChild );
				}
			}
			else if ( typeof val === "object" )
			{
				if ( !doctype )
					this[DOCTYPE] = this.insertBefore( this.createDocumentType( val.name, val.publicId, val.systemId ), this.firstChild );
				else setupDocumentType( doctype, val.name, val.publicId, val.systemId );
			}
		}
		else if ( val === null && this[DOCTYPE] )
		{
			this.removeChild( this[DOCTYPE] );
			this[DOCTYPE] = null;
		}
	}
	
	get head()
	{
		return this[HEAD] || null;
	}
	
	get title()
	{
		const head = this.head;
		if ( head )
		{
			const title = head.getElementsByTagName( "title" );
			if ( title.length > 0 )
				return title[0].textContent;
		}
		return "";
	}
	set title( val )
	{
		const head = this.head;
		if ( head )
		{
			let title = head.getElementsByTagName( "title" );
			if ( title.length <= 0 )
				title = head.appendChild( this.createElement( "title" ) );
			else title = title[0];
			title.textContent = val;
		}
	}
	
	get body()
	{
		return this[BODY] || null;
	}
	set body( val )
	{
		if ( val instanceof Node && val.nodeType === Node.ELEMENT_NODE &&
			(val.tagName === "BODY" || val.tagName === "FRAMESET") &&
			val !== this[BODY] && this[DOCUMENT_ELEMENT] )
		{
			if ( this[BODY] ) this[BODY].parentNode.replaceChild( val, this[BODY] );
			else this[DOCUMENT_ELEMENT].appendChild( val );
		}
	}
	
	get entityEncoder()
	{
		return this[ENTITY_ENCODER];
	}
	
	createElement( tagName )
	{
		if ( tagName && typeof tagName === "string" )
		{
			const node = createNode( Node.ELEMENT_NODE );
			node[TAG_NAME] = tagName.toUpperCase();
			return node;
		}
	}
	
	createTextNode( text )
	{
		return createTextBasedNode( Node.TEXT_NODE, text );
	}
	
	createComment( data )
	{
		return createTextBasedNode( Node.COMMENT_NODE, data );
	}
	
	createCDATASection( data )
	{
		return createTextBasedNode( Node.CDATA_SECTION_NODE, data, "]]>" );
	}
	
	createProcessingInstruction( target, data )
	{
	NewNode:
		if ( target && typeof target === "string" )
		{
			if ( Parser.isNameCharStart( target[0] ) )
				for ( let i = 1; i < target.length; i++ )
				{
					if ( !Parser.isNameChar( target[i] ) )
						break NewNode;
				}
			else break NewNode;
			
			const node = createTextBasedNode( Node.PROCESSING_INSTRUCTION_NODE, data, "?>" );
			node.target = target;
			return node;
		}
		throw new Error( "Invalid target name "+ JSON.stringify( target ) +"." );
	}
	
	createDocumentType( name, publicId, systemId )
	{
		return setupDocumentType( createNode( Node.DOCUMENT_TYPE_NODE ), name, publicId, systemId );
	}
	
	getElementsByName( name )
	{
		const nodeList = [];
		if ( name && typeof name === "string" )
			this.forEach( node =>
			{
				if ( node.attributes && node.attributes.name === name )
					nodeList.push( node );
			} );
		return nodeList;
	}
}

function createTextBasedNode( type, text, disallowed = false )
{
	const node = createNode( type );
	node.nodeValue = "";
	if ( text && typeof text === "string" )
	{
		if ( disallowed && typeof disallowed === "string" && text.indexOf( disallowed ) !== -1 )
			throw new Error( "The data provided ('"+ text +"') contains '"+ disallowed +"'." );
		node.nodeValue += text;
	}
	return node;
}

function setupDocumentType( doctype, name, publicId, systemId )
{
	if ( name && typeof name === "string" )
	{
		doctype.name = name.toLowerCase();
		
		if ( publicId && typeof publicId === "string" )
			doctype.publicId = publicId;
		else doctype.publicId = "";
		
		if ( systemId && typeof systemId === "string" )
			doctype.systemId = systemId;
		else doctype.systemId = "";
	}
	else doctype.name = doctype.publicId = doctype.systemId = "";
	
	return doctype;
}

/* @START_UNIT_TESTS */
DOM.parseSelector = parseSelector;
/* @END_UNIT_TESTS */

DOM.Node = Node;
DOM.EntityEncoder = EntityEncoder;