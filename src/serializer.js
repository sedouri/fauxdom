import {PARSER_OPTIONS, nodeTypes, selfClosingTags, getDocument} from "./utils.js"

export function serializeNode( elem )
{
	let tagName = elem.tagName;
	const owner = getDocument( elem );
	const entities = owner ? owner.entityEncoder : null;
	let html = "";
	
	switch ( elem.nodeType )
	{
		case nodeTypes.ELEMENT_NODE:
			tagName = tagName.toLowerCase();
			html += "<"+ tagName;
			for ( const key in elem.attributes )
				if ( Object.hasOwn( elem.attributes, key ) )
				{
					let attr = elem.attributes[key];
					if ( attr === true )
						attr = "";
					else if ( entities && owner[PARSER_OPTIONS] )
						attr = encodeEntities( attr, entities, owner[PARSER_OPTIONS] );
					
					html += " "+ key;
					if ( attr !== "" )
						html += '="'+ attr +'"';
				}
			html += ">";
			
			for ( let i = 0; i < elem.childNodes.length; i++ )
				html += serializeNode( elem.childNodes[i] );
			
			if ( selfClosingTags[elem.tagName] !== true )
				html += "</"+ tagName +">";
			break;
			
		case nodeTypes.TEXT_NODE:
			if ( entities && owner[PARSER_OPTIONS] &&
				(!elem.parentNode || (elem.parentNode.tagName !== "SCRIPT" && elem.parentNode.tagName !== "STYLE")) )
					html += encodeEntities( elem.nodeValue, entities, owner[PARSER_OPTIONS] );
			else html += elem.nodeValue;
			break;
			
		case nodeTypes.CDATA_SECTION_NODE:
			html += "<![CDATA["+ elem.nodeValue +"]]>";
			break;
			
		case nodeTypes.PROCESSING_INSTRUCTION_NODE:
			html += "<?"+ elem.nodeName;
			if ( elem.nodeValue )
				html += " "+ elem.nodeValue;
			html += "?>";
			break;
			
		case nodeTypes.COMMENT_NODE:
			html += "<!--"+ elem.nodeValue +"-->";
			break;
			
		case nodeTypes.DOCUMENT_TYPE_NODE:
			html += "<!DOCTYPE";
			if ( elem.name )
				html += " "+ elem.name;
			if ( elem.publicId )
				html += ' PUBLIC "'+ elem.publicId +'"';
			if ( elem.systemId )
			{
				if ( !elem.publicId )
					html += " SYSTEM";
				html += ' "'+ elem.systemId +'"';
			}
			html += ">";
			break;
	}
	return html;
}

function encodeEntities( text, entities, options )
{
	if ( options.encodeEntities === false )
		return text;
	else if ( options.encodeEntities === true || !(options.encodeEntities instanceof RegExp) )
		return entities.encode( text );
	return entities.encode( text, options.encodeEntities );
}