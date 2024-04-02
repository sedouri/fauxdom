const DOM = require( "../" );
const {Node} = DOM;
const {printHierarchy, printElementList, describeNode} = require( "../scripts/printer" );

function testEachWithCallback( document, tests )
{
	test.each( tests )( "%s", ( _name, callback ) =>
	{
		const result = callback( document );
		if ( result !== undefined )
		{
			if ( result instanceof Node || result instanceof Array )
				expect( printHierarchy( result ) ).toMatchSnapshot();
			else expect( result ).toMatchSnapshot();
		}
		else expect( printHierarchy( document ) ).toMatchSnapshot();
	} );
}

function testEachCallbackResult( tests )
{
	test.each( tests )( "%s", ( _name, callback ) =>
	{
		const result = callback();
		if ( result instanceof Node || result instanceof Array )
			expect( printHierarchy( result ) ).toMatchSnapshot();
		else expect( result ).toMatchSnapshot();
	} );
}

function testEachWithQuery( document, name, tests )
{
	test.each( tests )( name +", %s", selector =>
		expect( describeNode( document.querySelector( selector ) ) ).toMatchSnapshot() );
}

function testEachWithQueryAll( document, name, tests )
{
	test.each( tests )( name +", %s", selector =>
		expect( printElementList( document.querySelectorAll( selector ) ) ).toMatchSnapshot() );
}

function testEachClosest( name, tests )
{
	test.each( tests )( name +", %s", ( selector, node ) =>
		expect( describeNode( node.closest( selector ) ) ).toMatchSnapshot() );
}

function testEachMatch( name, tests )
{
	test.each( tests )( name +", %s", ( selector, node, matches ) =>
		expect( node.matches( selector ) ).toBe( matches ) );
}

function testEachSelector( name, tests )
{
	test.each( tests )( name +", %s", selector =>
		expect( DOM.parseSelector( selector ) ).toMatchSnapshot() );
}

function testEachSelectorForFailue( name, tests )
{
	test.each( tests )( name +", %s", selector =>
		expect( () => DOM.parseSelector( selector ) ).toThrowErrorMatchingSnapshot() );
}

function testEachWithHTML( document, tests )
{
	test.each( tests )( "%s", ( _name, html ) =>
	{
		document.innerHTML = html;
		expect( printHierarchy( document ) ).toMatchSnapshot();
	} );
}

function testEachWithHTMLOutput( document, tests )
{
	test.each( tests )( "%s", ( _name, html ) =>
	{
		document.innerHTML = html;
		expect( document.innerHTML ).toMatchSnapshot();
	} );
}

function testEachWithAllOutput( document, tests )
{
	test.each( tests )( "%s", ( _name, html ) =>
	{
		document.innerHTML = html;
		expect( printAll( document ) ).toMatchSnapshot();
	} );
}

function testEachWithEntities( document, tests )
{
	test.each( tests )( "%s", ( _name, entities, html ) =>
	{
		document.entityEncoder.entities = entities;
		document.innerHTML = html;
		expect( document.innerHTML ).toMatchSnapshot();
	} );
}

function testEachWithStandardEntities( document, tests )
{
	test.each( tests )( "%s", ( _name, html ) =>
	{
		document.importStandardEntities();
		document.innerHTML = html;
		expect( printAll( document ) ).toMatchSnapshot();
	} );
}

function printAll( document )
{
	return "html:\n"+ document.innerHTML +"\n\nhierarchy:\n"+ printHierarchy( document );
}

module.exports = {
	DOM,
	testEachWithCallback,
	testEachCallbackResult,
	testEachWithQuery,
	testEachWithQueryAll,
	testEachClosest,
	testEachMatch,
	testEachSelector,
	testEachSelectorForFailue,
	testEachWithHTML,
	testEachWithHTMLOutput,
	testEachWithAllOutput,
	testEachWithEntities,
	testEachWithStandardEntities,
	printHierarchy,
	printElementList,
	printAll,
	describeNode
};