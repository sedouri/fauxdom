import DOM from "../index.js"
import {printHierarchy, printElementList, describeNode} from "../scripts/printer.js"

const {Node} = DOM;

export function testEachWithCallback( document, tests )
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

export function testEachCallbackResult( tests )
{
	test.each( tests )( "%s", ( _name, callback ) =>
	{
		const result = callback();
		if ( result instanceof Node || result instanceof Array )
			expect( printHierarchy( result ) ).toMatchSnapshot();
		else expect( result ).toMatchSnapshot();
	} );
}

export function testEachWithQuery( document, name, tests )
{
	test.each( tests )( name +", %s", selector =>
		expect( describeNode( document.querySelector( selector ) ) ).toMatchSnapshot() );
}

export function testEachWithQueryAll( document, name, tests )
{
	test.each( tests )( name +", %s", selector =>
		expect( printElementList( document.querySelectorAll( selector ) ) ).toMatchSnapshot() );
}

export function testEachClosest( name, tests )
{
	test.each( tests )( name +", %s", ( selector, node ) =>
		expect( describeNode( node.closest( selector ) ) ).toMatchSnapshot() );
}

export function testEachMatch( name, tests )
{
	test.each( tests )( name +", %s", ( selector, node, matches ) =>
		expect( node.matches( selector ) ).toBe( matches ) );
}

export function testEachSelector( name, tests )
{
	test.each( tests )( name +", %s", selector =>
		expect( DOM.parseSelector( selector ) ).toMatchSnapshot() );
}

export function testEachSelectorForFailue( name, tests )
{
	test.each( tests )( name +", %s", selector =>
		expect( () => DOM.parseSelector( selector ) ).toThrowErrorMatchingSnapshot() );
}

export function testEachWithHTML( document, tests )
{
	test.each( tests )( "%s", ( _name, html ) =>
	{
		document.innerHTML = html;
		expect( printHierarchy( document ) ).toMatchSnapshot();
	} );
}

export function testEachWithHTMLOutput( document, tests )
{
	test.each( tests )( "%s", ( _name, html ) =>
	{
		document.innerHTML = html;
		expect( document.innerHTML ).toMatchSnapshot();
	} );
}

export function testEachWithAllOutput( document, tests )
{
	test.each( tests )( "%s", ( _name, html ) =>
	{
		document.innerHTML = html;
		expect( printAll( document ) ).toMatchSnapshot();
	} );
}

export function testEachWithEntities( document, tests )
{
	test.each( tests )( "%s", ( _name, entities, html ) =>
	{
		document.entityEncoder.entities = entities;
		document.innerHTML = html;
		expect( document.innerHTML ).toMatchSnapshot();
	} );
}

export function testEachWithStandardEntities( document, tests )
{
	test.each( tests )( "%s", ( _name, html ) =>
	{
		document.importStandardEntities();
		document.innerHTML = html;
		expect( printAll( document ) ).toMatchSnapshot();
	} );
}

export function printAll( document )
{
	return "html:\n"+ document.innerHTML +"\n\nhierarchy:\n"+ printHierarchy( document );
}

export {
	DOM,
	printHierarchy,
	printElementList,
	describeNode
};