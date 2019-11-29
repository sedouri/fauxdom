import {parseSelector} from "./selector-parser.js";
import Node from "./node.js";
import {spacesRE, getDocument} from "./utils.js";

const STATE_INITIAL = 0,
	STATE_DESCENDANT_COMBINATOR = 1,
	STATE_CHILD_COMBINATOR = 2,
	STATE_NEXT_SIBLING_COMBINATOR = 3,
	STATE_SUBSEQUENT_SIBLING_COMBINATOR = 4,
	
	stateTransitions = {
		">": STATE_CHILD_COMBINATOR,
		"+": STATE_NEXT_SIBLING_COMBINATOR,
		"~": STATE_SUBSEQUENT_SIBLING_COMBINATOR
	},
	
	pseudoProcs = {
		is( scope, node, selectors )
		{
			return matchesSelectorList( scope, node, selectors );
		},
		not( scope, node, selectors )
		{
			return !matchesSelectorList( scope, node, selectors );
		},
		has( scope, node, selectors )
		{
			var has = false;
			
			for ( let i = 0; i < selectors.length; i++ )
				if ( selectors[i][0] instanceof Array && isRelativeSimpleSelector( selectors[i][0][0] ) )
				{
					has = matchesSelectorList( node, node, selectors, true );
					break;
				}
			
			if ( !has && node.childNodes.length > 0 ) node.forEach( elem =>
			{
				if ( matchesSelectorList( node, elem, selectors ) )
				{
					has = true;
					return false;
				}
			} );
			
			return has;
		}
	},
	pseudoClasses = {
		scope( scope, node )
		{
			return (node === scope);
		},
		
		enabled( scope, node )
		{
			switch ( node.tagName )
			{
				case "BUTTON":
				case "INPUT":
				case "SELECT":
				case "TEXTAREA":
				case "OPTGROUP":
				case "OPTION":
				case "FIELDSET":
					return !node.hasAttribute( "disabled" );
			}
			return false;
		},
		disabled( scope, node )
		{
			switch ( node.tagName )
			{
				case "BUTTON":
				case "INPUT":
				case "SELECT":
				case "TEXTAREA":
				case "OPTGROUP":
				case "OPTION":
				case "FIELDSET":
					return node.hasAttribute( "disabled" );
			}
			return false;
		},
		
		checked( scope, node )
		{
			if ( node.tagName === "INPUT" )
			{
				const type = node.getAttribute( "type" );
				if ( type === "checkbox" || type === "radio" )
					return node.hasAttribute( "checked" );
			}
			else if ( node.tagName === "OPTION" )
				return node.hasAttribute( "selected" );
			return false;
		},
		
		required( scope, node )
		{
			switch ( node.tagName )
			{
				case "INPUT":
				case "SELECT":
				case "TEXTAREA":
					return node.hasAttribute( "required" );
			}
			return false;
		},
		optional( scope, node )
		{
			switch ( node.tagName )
			{
				case "INPUT":
				case "SELECT":
				case "TEXTAREA":
					return !node.hasAttribute( "required" );
			}
			return false;
		},
		
		root( scope, node )
		{
			const document = getDocument( scope );
			return (!!document && document.documentElement === node);
		},
		empty( scope, node )
		{
			return (node.childNodes.length === 0);
		},
		
		["first-child"]( scope, node )
		{
			const nodes = node.parentNode.childNodes;
			let found;
			for ( let i = 0; i < nodes.length && !found; i++ )
				if ( nodes[i].nodeType === Node.ELEMENT_NODE )
					found = nodes[i];
			return (found === node);
		},
		["last-child"]( scope, node )
		{
			const nodes = node.parentNode.childNodes;
			let found;
			for ( let i = nodes.length - 1; i >= 0 && !found; i-- )
				if ( nodes[i].nodeType === Node.ELEMENT_NODE )
					found = nodes[i];
			return (found === node);
		},
		["only-child"]( scope, node )
		{
			const nodes = node.parentNode.childNodes;
			let first, last;
			for ( let s = 0, e = nodes.length - 1; e >= 0 && !(first && last); s++, e-- )
			{
				if ( !first && nodes[s].nodeType === Node.ELEMENT_NODE )
					first = nodes[s];
				if ( !last && nodes[e].nodeType === Node.ELEMENT_NODE )
					last = nodes[e];
			}
			return (first === last && first === node);
		},
		
		["first-of-type"]( scope, node )
		{
			const nodes = node.parentNode.childNodes,
				tagName = node.tagName;
			let found;
			for ( let i = 0; i < nodes.length && !found; i++ )
				if ( nodes[i].tagName === tagName )
					found = nodes[i];
			return (found === node);
		},
		["last-of-type"]( scope, node )
		{
			const nodes = node.parentNode.childNodes,
				tagName = node.tagName;
			let found;
			for ( let i = nodes.length - 1; i >= 0 && !found; i-- )
				if ( nodes[i].tagName === tagName )
					found = nodes[i];
			return (found === node);
		},
		["only-of-type"]( scope, node )
		{
			const nodes = node.parentNode.childNodes,
				tagName = node.tagName;
			let first, last;
			for ( let s = 0, e = nodes.length - 1; e >= 0 && !(first && last); s++, e-- )
			{
				if ( !first && nodes[s].tagName === tagName )
					first = nodes[s];
				if ( !last && nodes[e].tagName === tagName )
					last = nodes[e];
			}
			return (first === last && first === node);
		}
	};

pseudoProcs.where = pseudoProcs.is;

export function querySelector( scope, selector, all )
{
	const selectors = parseSelector( selector ),
		result = [];
	
	scope.forEach( node =>
	{
		if ( matchesSelectorList( scope, node, selectors ) )
		{
			result.push( node );
			if ( !all ) return false;
		}
	} );
	
	return (all ? result : (result[0] || null));
}

export function closest( scope, selector )
{
	const selectors = parseSelector( selector );
	let node = scope;
	
	while ( node != null && node.nodeType === Node.ELEMENT_NODE )
	{
		if ( matchesSelectorList( scope, node, selectors ) )
			return node;
		node = node.parentNode;
	}
	
	return null;
}

export function matches( scope, selector )
{
	return matchesSelectorList( scope, scope, parseSelector( selector ) );
}

function matchesSelectorList( scope, node, selectors, relative = false )
{
	var currentNode;
	
List:
	for ( let i = 0; i < selectors.length; i++ )
	{
		const complex = selectors[i];
		let state = STATE_INITIAL;
		
		if ( relative && complex[0] instanceof Array && !isRelativeSimpleSelector( complex[0][0] ) )
			continue;
		
		currentNode = node;
		
	Complex:
		for ( let x = (relative ? 0 : complex.length - 1);
			(relative ? x < complex.length : x >= 0);
			(relative ? x++ : x--) )
		{
			if ( stateTransitions.hasOwnProperty( complex[x] ) )
				state = stateTransitions[complex[x]];
			else switch ( state )
			{
				case STATE_INITIAL:
					if ( !matchesCompoundSelector( scope, currentNode, complex[x] ) )
						continue List;
					state = STATE_DESCENDANT_COMBINATOR;
					break;
					
				case STATE_DESCENDANT_COMBINATOR:
					while ( currentNode = currentNode.parentNode )
						if ( matchesCompoundSelector( scope, currentNode, complex[x] ) )
							continue Complex;
					continue List;
					
				case STATE_CHILD_COMBINATOR:
					currentNode = currentNode.parentNode;
					if ( !matchesCompoundSelector( scope, currentNode, complex[x] ) )
						continue List;
					break;
					
				case STATE_NEXT_SIBLING_COMBINATOR:
				{
					const nodes = currentNode.parentNode.childNodes;
					currentNode = nodes[nodes.indexOf( currentNode ) + (relative ? 1 : -1)];
					if ( !matchesCompoundSelector( scope, currentNode, complex[x] ) )
						continue List;
					break;
				}
				case STATE_SUBSEQUENT_SIBLING_COMBINATOR:
				{
					const nodes = currentNode.parentNode.childNodes;
					for ( let k = nodes.indexOf( currentNode ) + (relative ? 1 : -1);
							(relative ? k < nodes.length : k >= 0);
							(relative ? k++ : k--) )
						if ( matchesCompoundSelector( scope, nodes[k], complex[x] ) )
						{
							currentNode = nodes[k];
							continue Complex;
						}
					continue List;
				}
			}
		}
		return true;
	}
	return false;
}

function matchesCompoundSelector( scope, node, compound )
{
	if ( !node || node.nodeType !== Node.ELEMENT_NODE )
		return false;
	for ( let i = 0; i < compound.length; i++ )
	{
		const simple = compound[i];
		let matched;
		
		matched = false;
		switch ( simple.type )
		{
			case "universal": return true;
			
			case "type": matched = (node.tagName === simple.name); break;
			case "id": matched = (node.id === simple.name); break;
			case "class": matched = node.classList.contains( simple.name ); break;
			
			case "attr":
				if ( simple.comparison === "=" && (simple.value === true || simple.value === "") )
					matched = node.hasAttribute( simple.name );
				else
				{
					let attr = node.getAttribute( simple.name );
					if ( typeof attr === "string" )
					{
						let value = (simple.ignoreCase ? simple.value.toLowerCase() : simple.value);
						if ( simple.ignoreCase ) attr = attr.toLowerCase();
						if ( value !== "" ) switch ( simple.comparison )
						{
							case "=": matched = (attr === value); break;
							case "~=": matched = attr.split( spacesRE ).indexOf( value ) !== -1; break;
							case "|=": matched = (attr === value || attr.startsWith( value +"-" )); break;
							case "^=": matched = attr.startsWith( value ); break;
							case "$=": matched = attr.endsWith( value ); break;
							case "*=": matched = attr.indexOf( value ) !== -1; break;
						}
					}
				}
				break;
				
			case "pseudo-element": break;
			
			case "pseudo-class":
				if ( pseudoClasses.hasOwnProperty( simple.name ) )
					matched = !!pseudoClasses[simple.name].call( null, scope, node );
				break;
				
			case "pseudo-fn":
				if ( pseudoProcs.hasOwnProperty( simple.name ) )
					matched = !!pseudoProcs[simple.name].call( null, scope, node, simple.params );
				break;
		}
		
		if ( !matched ) return false;
	}
	return true;
}

function isRelativeSimpleSelector( simple )
{
	return (!!simple && simple.type === "pseudo-class" && simple.name === "scope");
}