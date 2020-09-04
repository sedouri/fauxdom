import {Lexer, EOF} from "./lexer.js";
import Node, {createNode} from "./node.js";
import {NODE_TYPE, TAG_NAME, PARSER_OPTIONS, spacesRE, selfClosingTags, setNodeParent, globalizeRegExp} from "./utils.js";

const toLowerCase = String.prototype.toLowerCase,
	toUpperCase = String.prototype.toUpperCase,
	
	defaultOptions = {
		allowCustomRootElement: false,
		allowSelfClosingSyntax: false,
		allowCDATA: false,
		allowProcessingInstructions: false,
		decodeEntities: false,
		encodeEntities: false,
		collapseWhitespace: false,
		trimWhitespace: false,
		lowerAttributeCase: false
	},
	
	STATE_START_TAG = 0,
	STATE_ATTRIBUTE = 1,
	STATE_END_TAG = 2,
	
	// '12.1.2.3 Attributes' from HTML5 spec.
	attributeNameExclusions = {
		//"\0": true, // This is caught by the lexer in isWhiteSpace().
		//'"': true, // Disabled to better match browser behaviour.
		//"'": true, // Disabled to better match browser behaviour.
		">": true,
		"/": true,
		"=": true
	},
	
	pTagBoundary = {P: true},
	definitionTagBoundary = {DT: true, DD: true},
	tableStructureTagBoundary = {TBODY: true, THEAD: true, TFOOT: true},
	tableCellTagBoundary = {TD: true, TH: true},
	formElementTagBoundary = {BUTTON: true, DATALIST: true, OPTGROUP: true, OPTION: true, PROGRESS: true, SELECT: true, TEXTAREA: true},
	
	// Largely based on '8.1.2.4 Optional tags' from the HTML5 spec.
	// https://www.w3.org/TR/html50/syntax.html#syntax-tag-omission
	tagBoundaries = {
		ADDRESS: pTagBoundary,
		ARTICLE: pTagBoundary,
		ASIDE: pTagBoundary,
		BLOCKQUOTE: pTagBoundary,
		DIV: pTagBoundary,
		FIELDSET: pTagBoundary,
		FOOTER: pTagBoundary,
		H1: pTagBoundary,
		H2: pTagBoundary,
		H3: pTagBoundary,
		H4: pTagBoundary,
		H5: pTagBoundary,
		H6: pTagBoundary,
		HEADER: pTagBoundary,
		HGROUP: pTagBoundary,
		HR: pTagBoundary,
		MAIN: pTagBoundary,
		NAV: pTagBoundary,
		P: pTagBoundary,
		PRE: pTagBoundary,
		SECTION: pTagBoundary,
		
		BODY: {HEAD: true, TITLE: true},
		
		// Definitions
		DL: pTagBoundary,
		DD: definitionTagBoundary,
		DT: definitionTagBoundary,
		
		// Tables
		TABLE: pTagBoundary,
		TBODY: tableStructureTagBoundary,
		THEAD: tableStructureTagBoundary,
		TD: tableCellTagBoundary,
		TFOOT: tableStructureTagBoundary,
		TH: tableCellTagBoundary,
		TR: {TR: true},
		
		// Lists
		LI: {LI: true},
		OL: pTagBoundary,
		UL: pTagBoundary,
		
		// Forms
		BUTTON: formElementTagBoundary,
		DATALIST: formElementTagBoundary,
		FORM: pTagBoundary,
		INPUT: formElementTagBoundary,
		OPTGROUP: {OPTGROUP: true, OPTION: true},
		OPTION: {OPTION: true},
		OUTPUT: formElementTagBoundary,
		PROGRESS: formElementTagBoundary,
		SELECT: formElementTagBoundary,
		TEXTAREA: formElementTagBoundary,
	};

export default class Parser
{
	constructor( html, options, entityEncoder )
	{
		this.options = Parser.setupOptions( options );
		this.lexer = new Lexer( html );
		this.entityEncoder = entityEncoder;
	}
	
	static setupOptions( options )
	{
		options = Object.assign( {}, defaultOptions, options );
		if ( options.encodeEntities instanceof RegExp )
			options.encodeEntities = globalizeRegExp( options.encodeEntities );
		return Object.freeze( options );
	}
	
	static isNameCharStart( chr )
	{
		return chr === ":" || chr === "_" || (chr >= "A" && chr <= "Z") || (chr >= "a" && chr <= "z") ||
			(chr >= "\xC0" && chr <= "\xD6") || (chr >= "\xD8" && chr <= "\xF6") ||
			(chr >= "\xF8" && chr <= "\u02FF") || (chr >= "\u0370" && chr <= "\u037D") ||
			(chr >= "\u037F" && chr <= "\u1FFF") || chr === "\u200C" || chr === "\u200D" ||
			(chr >= "\u2070" && chr <= "\u218F") || (chr >= "\u2C00" && chr <= "\u2FEF") ||
			(chr >= "\u3001" && chr <= "\uD7FF") || (chr >= "\uF900" && chr <= "\uFDCF") ||
			(chr >= "\uFDF0" && chr <= "\uFFFD") || (chr >= "\u10000" && chr <= "\uEFFFF");
	}
	
	static isNameChar( chr )
	{
		return Parser.isNameCharStart( chr ) ||
			(chr >= "0" && chr <= "9") || chr === "-" || chr === "." || chr === "\xB7" ||
			(chr >= "\u0300" && chr <= "\u036F") || chr === "\u203F" || chr === "\u2040";
	}
	
	parseHTML()
	{
		var rootNode = createNode( Node.DOCUMENT_FRAGMENT_NODE ),
			scopeChain = [rootNode], theChar;
		
		rootNode[PARSER_OPTIONS] = this.options;
		
		if ( this.options.trimWhitespace )
			theChar = this.lexer.skipWhiteSpace();
		else theChar = this.lexer.getChar();
		
		while ( theChar !== EOF && scopeChain.length > 0 )
		{
			if ( theChar === "<" )
				this.parseTag( scopeChain );
			else this.parseText( scopeChain );
			
			if ( this.options.trimWhitespace )
				theChar = this.lexer.skipWhiteSpace();
			else theChar = this.lexer.getChar();
		}
		
		return rootNode;
	}
	
	parseTag( scopeChain )
	{
		var node, name, selfClosing, state = STATE_START_TAG,
			tagStartIdx = this.lexer.index,
			theChar = this.lexer.getNextChar(),
			startIdx, endIdx;
		
		if ( theChar !== EOF )
	Main:
		while ( theChar !== ">" && theChar !== EOF )
		{
			startIdx = this.lexer.index;
			
			if ( state === STATE_START_TAG )
			{
				if ( theChar === "!" || theChar === "?" )
				{
					if ( this.options.allowProcessingInstructions && this.lexer.match( "?" ) )
					{
						startIdx = this.lexer.index;
						theChar = this.lexer.getChar();
					PINode:
						if ( Parser.isNameCharStart( theChar ) )
						{
							node = createNode( Node.PROCESSING_INSTRUCTION_NODE );
							
							// Find target's name.
							while ( theChar !== EOF && Parser.isNameChar( theChar ) )
								theChar = this.lexer.getNextChar();
							
							// If we have a non-whitespace character here that isn't EOF or
							// the end '?>', then we've come across an invalid name character
							// in the target name and this tag should be treated as a comment.
							if ( !this.lexer.isWhiteSpace( theChar ) && theChar !== EOF &&
									!(theChar === "?" && this.lexer.peek() === ">") )
								break PINode;
							
							node.target = this.lexer.str.slice( startIdx, this.lexer.index );
							
							this.lexer.skipWhiteSpace();
							startIdx = this.lexer.index;
							this.lexer.goToString( "?>" );
							node.nodeValue = this.lexer.str.slice( startIdx, this.lexer.index );
							this.lexer.advance( 1 );
							scopeChain[0].childNodes.push( node );
							setNodeParent( node, scopeChain[0] );
							break;
						}
						
						// Go back to before the first '?' to include everything between the
						// angle brackets in the comment we're going to create from this tag.
						this.lexer.advance( startIdx - this.lexer.index - 1 );
					}
					
					if ( this.options.allowCDATA && this.lexer.match( "![CDATA[" ) )
					{
						node = createNode( Node.CDATA_SECTION_NODE );
						startIdx = this.lexer.index;
						this.lexer.goToString( "]]>" );
						node.nodeValue = this.lexer.str.slice( startIdx, this.lexer.index );
						this.lexer.advance( 2 );
						scopeChain[0].childNodes.push( node );
						setNodeParent( node, scopeChain[0] );
						break;
					}
					else if ( this.lexer.match( "!DOCTYPE", false ) )
					{
						this.lexer.skipWhiteSpace();
						startIdx = this.lexer.index;
						this.lexer.goToString( ">" );
						
						let rootNode = scopeChain[scopeChain.length - 1];
						
						if ( rootNode.doctype )
							break;
						else if ( rootNode.childNodes.length > 0 )
							for ( let i = rootNode.childNodes.length - 1; i >= 0; i-- )
								if ( rootNode.childNodes[i].nodeType < Node.TEXT_NODE || rootNode.childNodes[i].nodeType > Node.COMMENT_NODE )
									break Main;
						
						let params = this.lexer.str.slice( startIdx, this.lexer.index ).split( spacesRE );
						node = createNode( Node.DOCUMENT_TYPE_NODE );
						node.name = toLowerCase.call( params.shift() );
						
						if ( params.length > 1 )
						{
							let idType = toLowerCase.call( params.shift() );
							params = params.join( " " ).split( '"' );
							if ( params[0] === "" ) switch ( idType )
							{
								case "public":
									params.shift();
									node.publicId = params.shift();
									
								case "system":
									params.shift();
									node.systemId = params.shift();
							}
						}
						
						if ( !node.publicId ) node.publicId = "";
						if ( !node.systemId ) node.systemId = "";
						
						rootNode.childNodes.push( node );
						rootNode.doctype = node;
						setNodeParent( node, rootNode );
						break;
					}
					else
					{
						let endTag;
						if ( this.lexer.match( "!--" ) )
						{
							if ( !this.lexer.match( ">" ) && !this.lexer.match( "->" ) )
								endTag = "-->";
						}
						else
						{
							if ( theChar === "!" ) // Don't skip question marks that show up here.
								this.lexer.getNextChar();
							endTag = ">";
						}
						
						node = createNode( Node.COMMENT_NODE );
						startIdx = this.lexer.index;
						if ( endTag ) this.lexer.goToString( endTag );
						node.nodeValue = this.lexer.str.slice( startIdx, this.lexer.index );
						this.lexer.advance( endTag ? endTag.length - 1 : -1 );
						scopeChain[0].childNodes.push( node );
						setNodeParent( node, scopeChain[0] );
						break;
					}
				}
				else if ( theChar === "/" )
				{
					theChar = this.lexer.getNextChar();
					state = STATE_END_TAG;
					startIdx += 1;
				}
			}
			
			if ( state === STATE_ATTRIBUTE )
			{
				// Find an attribute name.
				while ( (this.lexer.index === startIdx && theChar === "=") ||
						(!this.lexer.isWhiteSpace( theChar ) &&
 						!attributeNameExclusions[theChar] &&
 						theChar !== EOF) )
					theChar = this.lexer.getNextChar();
				endIdx = this.lexer.index;
			}
			else
			{
				// Find a tag name.
				while ( ((theChar >= "a" && theChar <= "z") || (theChar >= "A" && theChar <= "Z") ||
						(this.lexer.index > startIdx && ((theChar >= "0" && theChar <= "9") || theChar === "-" || theChar === "_" || theChar === ":"))) &&
						theChar !== EOF )
					theChar = this.lexer.getNextChar();
				endIdx = this.lexer.index;
				if ( theChar === EOF )
				{
					this.addTextNode( scopeChain, tagStartIdx, endIdx, false );
					return;
				}
				theChar = this.lexer.skipWhiteSpace();
				
				if ( state === STATE_END_TAG )
					theChar = this.lexer.goToString( ">" );
			}
			
			if ( startIdx === endIdx )
			{
				// Found an illegal character while searching for an attribute or tag name.
				if ( this.options.allowSelfClosingSyntax && theChar === "/" && this.lexer.peek() === ">" )
				{
					// If self-closing tag syntax is allowed, and we've found "/>", then we
					// need to close the tag at the top of the scope chain.
					theChar = this.lexer.getNextChar();
					state = STATE_END_TAG;
					name = scopeChain[0][TAG_NAME];
				}
				else if ( state === STATE_START_TAG )
				{
					this.lexer.goToString( "<" );
					this.addTextNode( scopeChain, tagStartIdx, this.lexer.index, false );
					tagStartIdx = this.lexer.index;
					theChar = this.lexer.getNextChar();
					continue;
				}
				else if ( state === STATE_END_TAG )
				{
					if ( startIdx === this.lexer.index ) break; // This throws "</>" away.
					node = this.addTextNode( scopeChain, startIdx, this.lexer.index );
					node[NODE_TYPE] = Node.COMMENT_NODE;
					break;
				}
				else
				{
					// All other illegal characters are simply skipped over, along with any
					// following whitespace.
					this.lexer.getNextChar();
					theChar = this.lexer.skipWhiteSpace();
					continue;
				}
			}
			else
			{
				name = this.lexer.str.slice( startIdx, endIdx );
				if ( state !== STATE_ATTRIBUTE )
					name = toUpperCase.call( name );
				theChar = this.lexer.skipWhiteSpace();
			}
			
			switch ( state )
			{
				case STATE_START_TAG:
					node = createNode( Node.ELEMENT_NODE );
					node[TAG_NAME] = name;
					while ( tagBoundaries.hasOwnProperty( node[TAG_NAME] ) && tagBoundaries[node[TAG_NAME]][scopeChain[0][TAG_NAME]] )
						scopeChain.splice( 0, 1 );
					scopeChain[0].childNodes.push( node );
					setNodeParent( node, scopeChain[0] );
					state = STATE_ATTRIBUTE;
					selfClosing = selfClosingTags[node[TAG_NAME]];
					if ( selfClosing !== true ) scopeChain.unshift( node );
					break;
					
				case STATE_ATTRIBUTE:
					let value = true;
					
					if ( this.options.lowerAttributeCase )
						name = toLowerCase.call( name );
					
					if ( theChar === "=" )
					{
						this.lexer.getNextChar();
						theChar = this.lexer.skipWhiteSpace();
						startIdx = this.lexer.index;
						
						if ( theChar === '"' || theChar === "'" )
						{
							this.lexer.getNextChar();
							this.lexer.goToString( theChar );
							endIdx = this.lexer.index;
							startIdx += 1;
							this.lexer.getNextChar();
							theChar = this.lexer.skipWhiteSpace();
						}
						else // Unquoted attribute value
						{
							while ( !this.lexer.isWhiteSpace( theChar ) &&
									//!unquotedAttributeExclusions[theChar] &&
									theChar !== ">" &&
									(!this.options.allowSelfClosingSyntax || !(theChar === "/" && this.lexer.peek() === ">")) &&
									theChar !== EOF )
								theChar = this.lexer.getNextChar();
							endIdx = this.lexer.index;
							theChar = this.lexer.skipWhiteSpace();
						}
						
						if ( node.attributes.hasOwnProperty( name ) ) break;
						value = this.lexer.str.slice( startIdx, endIdx );
						
						if ( value === "" )
							value = true;
						else if ( this.options.decodeEntities )
							value = this.entityEncoder.decode( value );
					}
					else if ( node.attributes.hasOwnProperty( name ) ) break;
					
					node.attributes[name] = value;
					break;
					
				case STATE_END_TAG:
					for ( let i = 0; i < scopeChain.length; i++ )
						if ( scopeChain[i][TAG_NAME] === name )
						{
							node = scopeChain[i];
							while ( scopeChain.length > 0 && scopeChain[0] !== node )
								scopeChain.shift();
							scopeChain.shift();
							break;
						}
					break;
			}
		}
		else this.addTextNode( scopeChain, tagStartIdx, this.lexer.index, false );
		
		this.lexer.getNextChar();
	}
	
	parseText( scopeChain )
	{
		var startIdx = this.lexer.index,
			preserveContent = false;
		
		if ( scopeChain[0][TAG_NAME] === "SCRIPT" || scopeChain[0][TAG_NAME] === "STYLE" )
		{
			this.lexer.goToString( "<\/"+ scopeChain[0][TAG_NAME], false );
			preserveContent = true;
		}
		else this.lexer.goToString( "<" );
		
		this.addTextNode( scopeChain, startIdx, this.lexer.index, preserveContent );
	}
	
	addTextNode( scopeChain, startIdx, endIdx, preserveContent )
	{
		var node = createNode( Node.TEXT_NODE ),
			value = this.lexer.str.slice( startIdx, endIdx );
		
		if ( preserveContent != null )
		{
			if ( this.options.trimWhitespace )
				value = value.trim();
			else if ( this.options.collapseWhitespace && !preserveContent )
				value = value.replace( spacesRE, " " );
			
			if ( this.options.decodeEntities && !preserveContent )
				value = this.entityEncoder.decode( value );
		}
		
		node.nodeValue = value;
		scopeChain[0].childNodes.push( node );
		setNodeParent( node, scopeChain[0] );
		
		return node;
	}
}