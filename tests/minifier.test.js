const {DOM, printHierarchy, describeNode} = require( "./utils" );
const htmlContent = require( "fs" ).readFileSync( "./tests/minifier.test.html", "utf8" );

describe( "Whitespace Minifier", () =>
{
	test( "Basic minification", () =>
	{
		const document = new DOM( htmlContent );
		document.minifyWhitespace();
		expect( document.innerHTML ).toMatchSnapshot();
	} );
	
	test( "Adjacent text nodes", () =>
	{
		const document = new DOM( htmlContent );
		document.querySelector( "span b" ).replaceWith( " and " );
		document.minifyWhitespace();
		expect( document.innerHTML ).toMatchSnapshot();
	} );
	
	test( "Custom inline elements", () =>
	{
		const document = new DOM( htmlContent );
		document.minifyWhitespace( ["div", "p", true] );
		expect( document.innerHTML ).toMatchSnapshot();
	} );
	
	test( "Minify inline CSS & JavaScript", () =>
	{
		const document = new DOM( htmlContent );
		document.minifyWhitespace( null, {
			inlineStyles( _node, value, _filePath )
			{
				return basicValueMinifier( value );
			},
			
			style( _node, value, _filePath )
			{
				return basicValueMinifier( value );
			},
			
			script( _node, value, filePath )
			{
				const val = basicValueMinifier( value );
				return (val ? `/*! ${filePath} */${val}` : null);
			}
		}, "./tests/minifier.test.html" );
		expect( document.innerHTML ).toMatchSnapshot();
	} );
} );

function basicValueMinifier( value )
{
	if ( value === true ) return null;
	
	const val = (value || "")
		.replace( /^\s+(.*?)\s*$/mg, "$1" )
		.replace( /\s*([(),])\s*/g, "$1" )
		.replace( /([^:]+:)\s*([^;]+(?:;|$))\s*/mg, "$1$2" )
		.replace( /[\n|\r|\n\r]+/g, "" )
		.replace( /;}/g, "}" )
		.replace( /;$/, "" );
	
	return (val === "" ? null : val);
}