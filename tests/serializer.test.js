import {DOM, testEachWithHTMLOutput, testEachWithAllOutput} from "./utils.js"

const documentHead = "<!DOCTYPE html><html><head>";
const documentMid = "</head><body>";
const documentFoot = "</body></html>";

describe( "Elements", () =>
{
	const document = new DOM( null );
	testEachWithHTMLOutput( document, [
		["Basic document", documentHead + documentMid + documentFoot],
		
		["Basic element attributes", '<div id="id" hidden></div>'],
	] );
	
	test( "Overridden element attributes object", () =>
	{
		const attr = Object.create( {foo: true} );
		attr.bar = true;
		document.innerHTML = "<div>";
		document.childNodes[0].attributes = attr;
		expect( document.innerHTML ).toMatchSnapshot();
	} );
	
	test( "Unowned element", () =>
	{
		const div = document.createElement( "div" );
		div.attributes = {id: 1};
		expect( div.outerHTML ).toMatchSnapshot();
	} );
	
	test( "Unowned text node", () =>
	{
		expect( document.createTextNode( "text" ).outerHTML ).toMatchSnapshot();
	} );
	
	testEachWithAllOutput( new DOM( null, {decodeEntities: true, encodeEntities: true} ), [
		["Entities in element attributes", '<input id="&amp;">'],
	] );
} );

describe( "Comments", () =>
{
	const document = new DOM( null );
	testEachWithHTMLOutput( document, [
		["Simple", "<!-- comment -->"],
	] );
} );

describe( "CDATA", () =>
{
	const document = new DOM( null, {allowCDATA: true, decodeEntities: true, encodeEntities: true} );
	testEachWithAllOutput( document, [
		["Simple", "<![CDATA[ data ]]>"],
		["With an entity and possibly troublesome characters", "<![CDATA[ &amp;te<s>t ]]>"],
	] );
} );

describe( "Processing Instructions", () =>
{
	const document = new DOM( null, {allowProcessingInstructions: true} );
	testEachWithAllOutput( document, [
		["Simple", "<?target data?>"],
		["No data", "<?target?>"],
	] );
} );