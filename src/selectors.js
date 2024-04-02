import {parseSelector} from "./selector-parser.js"
import Node from "./node.js"
import {NODE_TYPE, PARENT_NODE, TAG_NAME, spacesRE, getDocument} from "./utils.js"

const STATE_INITIAL = 0;
const STATE_DESCENDANT_COMBINATOR = 1;
const STATE_CHILD_COMBINATOR = 2;
const STATE_NEXT_SIBLING_COMBINATOR = 3;
const STATE_SUBSEQUENT_SIBLING_COMBINATOR = 4;

const stateTransitions = {
	">": STATE_CHILD_COMBINATOR,
	"+": STATE_NEXT_SIBLING_COMBINATOR,
	"~": STATE_SUBSEQUENT_SIBLING_COMBINATOR
};

const pseudoProcs =
{
	is( scope, node, selectors )
	{
		return matchesSelectorList( scope, node, selectors );
	},
	not( scope, node, selectors )
	{
		return !matchesSelectorList( scope, node, selectors );
	},
	has( _scope, node, selectors )
	{
		let has = false;
		
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
	},
	
	["nth-child"]( _scope, node, args )
	{
		const parent = node[PARENT_NODE],
			nodes = parent.childNodes,
			iter = new ChildIterator( args[0], args[1] );
		for ( let i = 0; i < nodes.length; i++ )
			if ( nodes[i][NODE_TYPE] === Node.ELEMENT_NODE )
			{
				if ( !args[2] || matchesSelectorList( parent, nodes[i], args[2] ) )
				{
					const iterMatch = iter.next();
					if ( nodes[i] === node )
						return iterMatch;
				}
			}
		return false;
	},
	["nth-last-child"]( _scope, node, args )
	{
		const parent = node[PARENT_NODE],
			nodes = parent.childNodes,
			iter = new ChildIterator( args[0], args[1] );
		for ( let i = nodes.length - 1; i >= 0; i-- )
			if ( nodes[i][NODE_TYPE] === Node.ELEMENT_NODE )
			{
				if ( !args[2] || matchesSelectorList( parent, nodes[i], args[2] ) )
				{
					const iterMatch = iter.next();
					if ( nodes[i] === node )
						return iterMatch;
				}
			}
		return false;
	},
	
	["nth-of-type"]( _scope, node, args )
	{
		const nodes = node[PARENT_NODE].childNodes,
			iter = new ChildIterator( args[0], args[1] ),
			tagName = node[TAG_NAME];
		for ( let i = 0; i < nodes.length; i++ )
			if ( nodes[i][TAG_NAME] === tagName )
			{
				const iterMatch = iter.next();
				if ( nodes[i] === node )
					return iterMatch;
			}
		
		// For code here to be reachable, 'node' would have to not be inside
		// its own parent, or the above test of 'nodes[i] === node' would
		// have to be skippable. Since neither of these scenarios is
		// possible (for now), an explicit 'return false' here never
		// executes and isn't needed.
	},
	["nth-last-of-type"]( _scope, node, args )
	{
		const nodes = node[PARENT_NODE].childNodes,
			iter = new ChildIterator( args[0], args[1] ),
			tagName = node[TAG_NAME];
		for ( let i = nodes.length - 1; i >= 0; i-- )
			if ( nodes[i][TAG_NAME] === tagName )
			{
				const iterMatch = iter.next();
				if ( nodes[i] === node )
					return iterMatch;
			}
		
		// For code here to be reachable, 'node' would have to not be inside
		// its own parent, or the above test of 'nodes[i] === node' would
		// have to be skippable. Since neither of these scenarios is
		// possible (for now), an explicit 'return false' here never
		// executes and isn't needed.
	}
};

const pseudoClasses =
{
	scope( scope, node )
	{
		return (node === scope);
	},
	
	enabled( _scope, node )
	{
		switch ( node[TAG_NAME] )
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
	disabled( _scope, node )
	{
		switch ( node[TAG_NAME] )
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
	
	checked( _scope, node )
	{
		if ( node[TAG_NAME] === "INPUT" )
		{
			const type = node.getAttribute( "type" );
			if ( type === "checkbox" || type === "radio" )
				return node.hasAttribute( "checked" );
		}
		else if ( node[TAG_NAME] === "OPTION" )
			return node.hasAttribute( "selected" );
		return false;
	},
	
	required( _scope, node )
	{
		switch ( node[TAG_NAME] )
		{
			case "INPUT":
			case "SELECT":
			case "TEXTAREA":
				return node.hasAttribute( "required" );
		}
		return false;
	},
	optional( _scope, node )
	{
		switch ( node[TAG_NAME] )
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
	empty( _scope, node )
	{
		return (node.childNodes.length === 0);
	},
	
	["first-child"]( _scope, node )
	{
		const nodes = node[PARENT_NODE].childNodes;
		for ( let i = 0; i < nodes.length; i++ )
			if ( nodes[i][NODE_TYPE] === Node.ELEMENT_NODE )
				return (nodes[i] === node);
		
		// For code here to be reachable, we would have to be looking at an
		// ELEMENT_NODE node inside a parent that has no ELEMENT_NODE nodes.
		// Therefore, an explicit 'return false' here never executes and
		// isn't needed.
	},
	["last-child"]( _scope, node )
	{
		const nodes = node[PARENT_NODE].childNodes;
		for ( let i = nodes.length - 1; i >= 0; i-- )
			if ( nodes[i][NODE_TYPE] === Node.ELEMENT_NODE )
				return (nodes[i] === node);
		
		// For code here to be reachable, we would have to be looking at an
		// ELEMENT_NODE node inside a parent that has no ELEMENT_NODE nodes.
		// Therefore, an explicit 'return false' here never executes and
		// isn't needed.
	},
	["only-child"]( _scope, node )
	{
		const nodes = node[PARENT_NODE].childNodes;
		let first, last;
		for ( let s = 0, e = nodes.length - 1; e >= 0 && !(first && last); s++, e-- )
		{
			if ( !first && nodes[s][NODE_TYPE] === Node.ELEMENT_NODE )
				first = nodes[s];
			if ( !last && nodes[e][NODE_TYPE] === Node.ELEMENT_NODE )
				last = nodes[e];
		}
		return (first === last && first === node);
	},
	
	["first-of-type"]( _scope, node )
	{
		const nodes = node[PARENT_NODE].childNodes,
			tagName = node[TAG_NAME];
		for ( let i = 0; i < nodes.length; i++ )
			if ( nodes[i][TAG_NAME] === tagName )
				return (nodes[i] === node);
		
		// For code here to be reachable, we would have to be looking at an
		// ELEMENT_NODE node inside a parent that has no ELEMENT_NODE nodes.
		// Therefore, an explicit 'return false' here never executes and
		// isn't needed.
	},
	["last-of-type"]( _scope, node )
	{
		const nodes = node[PARENT_NODE].childNodes,
			tagName = node[TAG_NAME];
		for ( let i = nodes.length - 1; i >= 0; i-- )
			if ( nodes[i][TAG_NAME] === tagName )
				return (nodes[i] === node);
		
		// For code here to be reachable, we would have to be looking at an
		// ELEMENT_NODE node inside a parent that has no ELEMENT_NODE nodes.
		// Therefore, an explicit 'return false' here never executes and
		// isn't needed.
	},
	["only-of-type"]( _scope, node )
	{
		const nodes = node[PARENT_NODE].childNodes,
			tagName = node[TAG_NAME];
		let first, last;
		for ( let s = 0, e = nodes.length - 1; e >= 0 && !(first && last); s++, e-- )
		{
			if ( !first && nodes[s][TAG_NAME] === tagName )
				first = nodes[s];
			if ( !last && nodes[e][TAG_NAME] === tagName )
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
	
	while ( node != null && node[NODE_TYPE] === Node.ELEMENT_NODE )
	{
		if ( matchesSelectorList( scope, node, selectors ) )
			return node;
		node = node[PARENT_NODE];
	}
	
	return null;
}

export function matches( scope, selector )
{
	return matchesSelectorList( scope, scope, parseSelector( selector ) );
}

function matchesSelectorList( scope, node, selectors, relative = false )
{
	let currentNode;
	
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
			if ( Object.hasOwn( stateTransitions, complex[x] ) )
				state = stateTransitions[complex[x]];
			else switch ( state )
			{
				case STATE_INITIAL:
					if ( !matchesCompoundSelector( scope, currentNode, complex[x] ) )
						continue List;
					state = STATE_DESCENDANT_COMBINATOR;
					break;
					
				case STATE_DESCENDANT_COMBINATOR:
					// deno-lint-ignore no-cond-assign
					while ( currentNode = currentNode[PARENT_NODE] )
						if ( matchesCompoundSelector( scope, currentNode, complex[x] ) )
							continue Complex;
					continue List;
					
				case STATE_CHILD_COMBINATOR:
					currentNode = currentNode[PARENT_NODE];
					if ( !matchesCompoundSelector( scope, currentNode, complex[x] ) )
						continue List;
					break;
					
				case STATE_NEXT_SIBLING_COMBINATOR:
				{
					const nodes = currentNode[PARENT_NODE].childNodes;
					currentNode = nodes[nodes.indexOf( currentNode ) + (relative ? 1 : -1)];
					if ( !matchesCompoundSelector( scope, currentNode, complex[x] ) )
						continue List;
					break;
				}
				case STATE_SUBSEQUENT_SIBLING_COMBINATOR:
				{
					const nodes = currentNode[PARENT_NODE].childNodes;
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
	if ( !node || node[NODE_TYPE] !== Node.ELEMENT_NODE )
		return false;
	for ( let i = 0; i < compound.length; i++ )
	{
		const simple = compound[i];
		let matched;
		
		matched = false;
		switch ( simple.type )
		{
			case "universal": return true;
			
			case "type": matched = (node[TAG_NAME] === simple.name); break;
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
						const value = (simple.ignoreCase ? simple.value.toLowerCase() : simple.value);
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
				if ( Object.hasOwn( pseudoClasses, simple.name ) )
					matched = !!pseudoClasses[simple.name].call( null, scope, node );
				break;
				
			case "pseudo-fn":
				if ( Object.hasOwn( pseudoProcs, simple.name ) )
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

class ChildIterator
{
	constructor( A, B )
	{
		this.A = parseInt( A, 10 ) | 0;
		this.B = parseInt( B, 10 ) | 0;
		this.current = 0;
	}
	
	next()
	{
		if ( this.A === 0 && this.B === 0 )
			return false;
		
		this.current += 1;
		
		let match = false;
		if ( this.A === 0 )
			match = (this.current === this.B);
		else if ( (this.A < 0 && this.B >= this.current) || (this.A > 0 && this.current >= this.B) )
			match = (((this.current + this.B) % this.A) === 0);
		
		return match;
	}
}