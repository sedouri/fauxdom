import {Lexer, EOF} from "./lexer.js";

const newLinesRE = /\r\n|\r|\f/g,
	anbSyntaxRE = /\(\s*(even|odd|(?:(?:([+-]?\d*)n)\s*(?:([+-])\s*(\d+))?|([+-]?\d+)))\s*/g;

const paramExpectations = {
	"is": "selectors",
	"not": "selectors",
	"where": "selectors", // Alias of :is()
	"has": "selectors",
	
	"lang": "identifier", // Not implementing
	"dir": "identifier", // Not implementing
	
	"nth-child": "An+B", // nyi
	"nth-last-child": "An+B", // nyi
	"nth-of-type": "An+B", // nyi
	"nth-last-of-type": "An+B", // nyi
	"nth-col": "An+B", // Not implementing
	"nth-last-col": "An+B", // Not implementing
};

// https://drafts.csswg.org/selectors-4/

export function parseSelector( selector )
{
	return parseSelectorList( new Lexer( selector.replace( newLinesRE, "\n" ) ) );
}

function parseSelectorList( lexer, terminator = EOF, relative = false )
{
	var theChar = lexer.skipWhiteSpace(),
		selector = {},
		compound = [],
		complex = [compound],
		ast = [complex];
	
	while ( theChar !== EOF && theChar !== terminator )
	{
		switch ( theChar )
		{
			case "*": // https://drafts.csswg.org/selectors-4/#universal-selector
				if ( compound.length > 0 )
					throw syntaxError( "Universal selectors must come before all other simple selectors.", lexer );
				selector.type = "universal";
				compound.push( selector );
				selector = {};
				break;
				
			case "#":
			case ".":
			{
				lexer.getNextChar();
				const name = parseIdentifier( lexer );
				if ( !name ) throw syntaxError( "Expected an identifier.", lexer );
				
				selector.type = (theChar === "#" ? "id" : "class");
				selector.name = name;
				
				compound.push( selector );
				selector = {};
				break;
			}
			case "[": // https://drafts.csswg.org/selectors-4/#attribute-selectors
			{
				lexer.getNextAfterWhiteSpace();
				const name = parseIdentifier( lexer );
				if ( !name ) throw syntaxError( "Expected an identifier.", lexer );
				
				selector.type = "attr";
				selector.name = name;
				selector.comparison = "=";
				selector.value = true;
				selector.ignoreCase = false;
				
				if ( (theChar = lexer.getNextAfterWhiteSpace()) !== "]" )
				{
					switch ( theChar )
					{
						case "=": break;
						
						case "~":
						case "|":
						case "^":
						case "$":
						case "*":
							if ( lexer.peek() !== "=" ) throw syntaxError( "Expected '='.", lexer, 1 );
							selector.comparison = theChar + selector.comparison;
							lexer.getNextChar();
							break;
							
						default: throw syntaxError( "Unexpected character '"+ (theChar === EOF ? "END_OF_INPUT" : theChar) +"'.", lexer );
					}
					
					theChar = lexer.getNextAfterWhiteSpace();
					if ( theChar === "'" || theChar === '"' )
					{
						// https://drafts.csswg.org/css-syntax-3/#consume-string-token
						const quote = theChar;
						
						selector.value = "";
						theChar = lexer.getNextChar();
						
						while ( theChar !== EOF && theChar !== quote && theChar !== "\n" )
						{
							if ( theChar === "\\" )
							{
								selector.value += parseEscapedCodePoint( lexer );
								theChar = lexer.getChar();
							}
							else
							{
								selector.value += theChar;
								theChar = lexer.getNextChar();
							}
						}
					}
					else
					{
						const name = parseIdentifier( lexer );
						if ( !name ) throw syntaxError( "Expected an identifier.", lexer );
						selector.value = name;
					}
					
					if ( lexer.getNextAfterWhiteSpace() !== "]" )
					{
						const ident = parseIdentifier( lexer );
						if ( ident === "i" || ident === "I" )
							selector.ignoreCase = true;
						else if ( ident === "s" || ident === "S" )
							selector.ignoreCase = false;
						else if ( ident )
							throw syntaxError( "Unexpected identifier '"+ ident +"'.", lexer, -ident.length + 1 );
						
						if ( lexer.getNextAfterWhiteSpace() !== "]" )
							throw syntaxError( "Expected ']'.", lexer, -1 + ident.length );
					}
				}
				
				compound.push( selector );
				selector = {};
				break;
			}
			case ":":
			{
				lexer.getNextChar();
				if ( lexer.match( ":" ) ) // https://drafts.csswg.org/selectors-4/#pseudo-elements
				{
					const name = parseIdentifier( lexer );
					if ( !name ) throw syntaxError( "Expected a pseudo-element name.", lexer );
					
					selector.type = "pseudo-element";
					selector.name = name;
				}
				else // https://drafts.csswg.org/selectors-4/#pseudo-classes
				{
					const name = parseIdentifier( lexer );
					if ( !name ) throw syntaxError( "Expected a pseudo-class name.", lexer );
					
					selector.type = "pseudo-class";
					selector.name = name;
					
					if ( paramExpectations[name] )
					{
						selector.type = "pseudo-fn";
						
						if ( lexer.getNextChar() !== "(" )
							throw syntaxError( "Expected '('.", lexer );
						
						switch ( paramExpectations[name] )
						{
							case "An+B": // https://drafts.csswg.org/css-syntax-3/#anb-microsyntax
								let A = 0, B = 0;
								
								anbSyntaxRE.lastIndex = lexer.index;
								const match = anbSyntaxRE.exec( lexer.str );
								if ( !match ) throw syntaxError( "Invalid parameter.", lexer, 1 );
								lexer.advance( match[0].length );
								if ( lexer.skipWhiteSpace() !== ")" )
									throw syntaxError( "Expected ')'.", lexer );
								
								if ( match[1] === "even" || match[1] === "odd" )
								{
									A = 2;
									if ( match[1] === "odd" ) B = 1;
								}
								else if ( match[5] ) // We found just an integer.
									B = parseInt( match[5], 10 );
								else
								{
									if ( match[2] === "-" ) A = -1;
									else if ( !match[2] || match[2] === "+" ) A = 1;
									else A = parseInt( match[2], 10 );
									
									if ( match[3] )
										B = parseInt( match[3] + match[4], 10 );
								}
								
								selector.params = [A, B];
								break;
								
							case "selectors":
								lexer.getNextChar();
								selector.params = parseSelectorList( lexer, ")", true );
								if ( selector.params.length === 0 )
									throw syntaxError( "Expected at least one selector.", lexer );
								break;
								
							case "identifier":
								if ( isIdentifierStart( lexer.getNextAfterWhiteSpace() ) )
									selector.params = [parseIdentifier( lexer )];
								else throw syntaxError( "Expected an identifier.", lexer );
								lexer.getNextChar();
								break;
						}
						if ( lexer.skipWhiteSpace() !== ")" ) throw syntaxError( "Expected ')'.", lexer );
					}
					// Having this branch here allows custom functional pseudo-classes with
					// these names to be defined by the user.
					else if ( name === "before" || name === "after" || name === "first-line" || name === "first-letter" )
						selector.type = "pseudo-element";
				}
				
				compound.push( selector );
				selector = {};
				break;
			}
			
			// https://drafts.csswg.org/selectors-4/#combinators
			case "+":
			case ">":
			case "~":
				if ( compound.length === 0 )
				{
					if ( complex.length === 1 )
					{
						if ( relative )
							complex.unshift( [{type: "pseudo-class", name: "scope"}] );
						else throw syntaxError( "Absolute selectors cannot start with a combinator.", lexer );
					}
					else if ( typeof complex[complex.length - 2] === "string" )
						throw syntaxError( "Cannot have multiple combinators in a row.", lexer );
					complex.splice( complex.length - 1, 0, theChar );
				}
				else complex.push( theChar, compound = [] );
				break;
				
			case ",":
				if ( compound.length === 0 )
				{
					if ( complex.length > 1 )
					{
						complex.pop();
						if ( typeof complex[complex.length - 1] === "string" )
							throw syntaxError( "Complex selectors are not allowed to end with a combinator.", lexer, -1 );
						ast.push( complex = [compound] );
					}
				}
				else ast.push( complex = [compound = []] );
				lexer.skipWhiteSpace();
				break;
				
			default:
				if ( lexer.isWhiteSpace( theChar ) )
				{
					if ( compound.length > 0 )
						complex.push( compound = [] );
					lexer.skipWhiteSpace();
					lexer.advance( -1 );
				}
				else if ( isIdentifierStart( theChar ) )
				{
					if ( compound.length > 0 )
						throw syntaxError( "Type (tag name) selectors must come before all other simple selectors.", lexer );
					
					selector.type = "type";
					// We'll always have a valid identifier here, thanks to
					// the isIdentifierStart() above.
					selector.name = parseIdentifier( lexer ).toUpperCase();
					
					compound.push( selector );
					selector = {};
				}
				else throw syntaxError( "Unexpected character '"+ theChar +"'.", lexer );
		}
		theChar = lexer.getNextChar();
	}
	
	if ( compound.length === 0 )
	{
		if ( complex.length === 1 )
		{
			ast.pop();
			complex = ast[ast.length - 1];
		}
		else complex.pop();
	}
	
	if ( complex && typeof complex[complex.length - 1] === "string" )
		throw syntaxError( "Complex selectors are not allowed to end with a combinator.", lexer, -1 );
	
	return ast;
}

function syntaxError( message, lexer, offset = 0 )
{
	var error = new SyntaxError( message ),
		column = lexer.index + offset;
	error.stack = "SyntaxError: "+ message +"\n\n"+ lexer.str +"\n"+ " ".repeat( column ) +"^\n    at index "+ column;
	return error;
}

// https://drafts.csswg.org/css-syntax-3/#consume-name
function parseIdentifier( lexer )
{
	var name = "",
		theChar = lexer.getChar();
	
	if ( isIdentifierStart( theChar ) )
	{
		do
		{
			if ( theChar === "\\" )
			{
				name += parseEscapedCodePoint( lexer );
				theChar = lexer.getChar();
			}
			else
			{
				name += theChar;
				theChar = lexer.getNextChar();
			}
		}
		while ( theChar !== EOF && (isIdentifierStart( theChar ) || (theChar >= "0" && theChar <= "9") || theChar === "-") )
		lexer.advance( -1 );
	}
	
	return name;
}

// https://drafts.csswg.org/css-syntax-3/#consume-escaped-code-point
function parseEscapedCodePoint( lexer )
{
	var theChar = lexer.getNextChar();
	
	if ( isHexDigit( theChar ) )
	{
		let codePoint = "";
		
		for ( let i = 5; i >= 0 && isHexDigit( theChar ); i-- )
		{
			codePoint += theChar;
			theChar = lexer.getNextChar();
		}
		
		if ( lexer.isWhiteSpace( theChar ) )
			lexer.getNextChar();
		
		codePoint = parseInt( codePoint, 16 ) | 0;
		if ( codePoint === 0 ||
			(codePoint >= 0xD800 && codePoint <= 0xDFFF) || // Surrogate
			codePoint > 0x10FFFF ) // Maximum allowed code point
				return "\uFFFD";
		return String.fromCodePoint( codePoint );
	}
	else if ( theChar === EOF ) return "\uFFFD";
	
	lexer.getNextChar();
	return theChar;
}

function isHexDigit( theChar )
{
	return (theChar !== EOF && ((theChar >= "0" && theChar <= "9") || (theChar >= "A" && theChar <= "F") || (theChar >= "a" && theChar <= "f")));
}

function isIdentifierStart( theChar )
{
	return ((theChar >= "A" && theChar <= "Z") || (theChar >= "a" && theChar <= "z") || theChar === "_" || theChar >= "\u0080" || theChar === "\\");
}