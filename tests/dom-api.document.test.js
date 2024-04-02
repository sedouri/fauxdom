// deno-lint-ignore-file no-self-assign

const {DOM, testEachWithCallback, printHierarchy} = require( "./utils" );

describe( "DOM API, Document", () =>
{
	const document = new DOM( "<html></html>" );
	const docFrag = new DOM();
	const ownerDoc = new DOM( "<html><body><div>hi" );
	const ownerDiv = ownerDoc.body.firstChild;
	
	testEachWithCallback( document, [
		["1.0.0 Get non-existent HEAD", () =>
		{
			return document.head;
		}],
		["1.0.1 Cycle title without HEAD", () =>
		{
			document.title = document.title;
		}],
		["1.0.2 Create HEAD", () =>
		{
			document.documentElement.appendChild( document.createElement( "head" ) );
		}],
		["1.0.3 Cycle title with HEAD", () =>
		{
			document.title = document.title;
		}],
		["1.0.4 Set title", () =>
		{
			document.title = "Title";
		}],
		["1.0.5 Try to add a second/raplacement HEAD", () =>
		{
			document.documentElement.appendChild( document.createElement( "head" ) );
		}],
		["1.0.6 Verify title", () =>
		{
			return document.title;
		}],
		["1.1.0 Get non-existent BODY", () =>
		{
			return document.body;
		}],
		["1.1.1 Create BODY", () =>
		{
			document.body = document.createElement( "body" );
		}],
		["1.1.2 Create invalid element (empty string)", () =>
		{
			return document.createElement( "" ) || null;
		}],
		["1.1.3 Create invalid element (boolean true)", () =>
		{
			return document.createElement( true ) || null;
		}],
		["1.1.4 Create comment", () =>
		{
			const comment = document.createComment( "<!-- comment -->" );
			expect( comment.outerHTML ).toMatchSnapshot();
			return comment;
		}],
		["1.2.0 Add a DIV", () =>
		{
			document.body.appendChild( document.createElement( "div" ) );
		}],
		["1.3.0 Replace BODY with FRAMESET", () =>
		{
			document.body = document.createElement( "frameset" );
		}],
		["1.3.1 Replace FRAMESET with BODY", () =>
		{
			document.body = document.createElement( "body" );
		}],
		["1.4.0 Create a couple elements", () =>
		{
			const div = document.createElement( "div" );
			div.appendChild( document.createTextNode( "text" ) );
			div.appendChild( document.createTextNode() );
			document.body.appendChild( div );
		}],
		["1.4.1 Add a document fragment", () =>
		{
			docFrag.innerHTML = "<span name=name>content";
			const span = docFrag.childNodes[0];
			document.body.appendChild( docFrag );
			expect( docFrag.ownerDocument === null ).toBe( true );
			expect( span.ownerDocument === document ).toBe( true );
			expect( span.firstChild.ownerDocument === document ).toBe( true );
		}],
		["1.4.2 Add a document fragment with a BODY, keeping only an H1", () =>
		{
			docFrag.innerHTML = "<body></body><h1 name=name>";
			document.documentElement.appendChild( docFrag );
			expect( docFrag.ownerDocument === null ).toBe( true );
		}],
		["1.5.0 Add a DOCTYPE using an object", () =>
		{
			document.doctype = {name: "html", publicId: "pub", systemId: "sys"};
		}],
		["1.5.1 Modify a DOCTYPE using an object", () =>
		{
			document.doctype = {name: "other"};
		}],
		["1.5.2 Modify a DOCTYPE directly", () =>
		{
			document.doctype.name = "name";
			document.doctype.publicId = "public";
			document.doctype.systemId = "system";
		}],
		["1.5.3 Clear the DOCTYPE using an object", () =>
		{
			document.doctype = {};
		}],
		["1.5.4 Add a DOCTYPE from another document", () =>
		{
			const otherDoc = new DOM( '<!DOCTYPE PUBLIC "foo">' );
			document.doctype = otherDoc.doctype;
			expect( otherDoc.doctype ).toBeNull();
		}],
		["1.5.5 Check for DOCTYPE", () => document.doctype],
		["1.5.6 Remove the DOCTYPE by setting it to null", () =>
		{
			document.doctype = null;
		}],
		["1.5.7 Check for DOCTYPE", () => document.doctype],
		["1.5.8 Add a DOCTYPE to a document fragment", () =>
		{
			const fragment = new DOM( "<div>" ),
				doctype = fragment.createDocumentType( "html" );
			fragment.doctype = doctype;
			return fragment;
		}],
		["1.6.0 Custom document element name", () =>
		{
			return new DOM( "<!DOCTYPE svg><svg></svg>", {allowCustomRootElement: true} );
		}],
		["1.6.1 Custom document element name, with elements outside document element", () =>
		{
			return new DOM( "<!DOCTYPE svg><path></path><svg></svg><rectangle>", {allowCustomRootElement: true} );
		}],
		["1.7.0 getElementsByName( 'name' )", () =>
		{
			return document.getElementsByName( "name" );
		}],
		["1.7.1 getElementsByName( 42 )", () =>
		{
			return document.getElementsByName( 42 );
		}],
		["1.7.2 getElementsByName()", () =>
		{
			return document.getElementsByName();
		}],
		["1.8.0 Set outerHTML", () =>
		{
			document.outerHTML = "<div>";
		}],
		["1.8.1 Get outerHTML", () =>
		{
			return document.outerHTML;
		}],
		["1.9.0 Verify 'ownerDocument', swap element between documents", () =>
		{
			document.body.appendChild( ownerDiv );
			expect( printHierarchy( document.body ) ).toMatchSnapshot();
			expect( ownerDiv.ownerDocument === document ).toBe( true );
			expect( ownerDiv.firstChild.ownerDocument === document ).toBe( true );
			
			document.body.removeChild( ownerDiv );
			expect( ownerDiv.ownerDocument === null ).toBe( true );
			expect( ownerDiv.firstChild.ownerDocument === null ).toBe( true );
			
			ownerDoc.body.appendChild( ownerDiv );
			expect( ownerDiv.ownerDocument === ownerDoc ).toBe( true );
			expect( ownerDiv.firstChild.ownerDocument === ownerDoc ).toBe( true );
			
			return ownerDoc;
		}],
		["1.9.1 Verify 'ownerDocument', replace all elements in document", () =>
		{
			ownerDoc.innerHTML = "<span>alternate";
			
			expect( ownerDiv.ownerDocument === null ).toBe( true );
			expect( ownerDiv.firstChild.ownerDocument === null ).toBe( true );
			
			return ownerDoc;
		}],
		
		// Try to break things
		["2.0.0 Add a whole document", () =>
		{
			document.body.appendChild( new DOM( "<html><body><h1>" ) );
		}],
		["2.0.1 Add document to itself", () =>
		{
			document.appendChild( document );
		}],
		["2.0.2 Add document to its own body", () =>
		{
			document.body.appendChild( document );
		}],
		["2.1.0 Add a document fragment to itself", () =>
		{
			docFrag.innerHTML = "<div>";
			docFrag.appendChild( docFrag );
			return docFrag;
		}],
		["2.1.1 Add a document fragment to a child of its own", () =>
		{
			docFrag.childNodes[0].appendChild( docFrag );
			return docFrag;
		}],
		["2.2.0 Add a malformed DOCTYPE using an object with no 'name'", () =>
		{
			document.doctype = {systemId: "sys"};
		}],
		["2.2.1 Set the DOCTYPE to true", () =>
		{
			document.doctype = true;
		}],
		["2.2.2 Set the DOCTYPE to false", () =>
		{
			document.doctype = false;
		}],
		["2.2.3 Set the DOCTYPE to DIV node", () =>
		{
			document.doctype = document.createElement( "div" );
		}],
		["2.3.0 Replace BODY with non-node (null)", () =>
		{
			document.body = null;
		}],
		["2.4.0 Make addChildNode() treat DIV elements like HEAD and BODY", () =>
		{
			const DIV = Object.prototype.DIV = Symbol( "div" );
			document.documentElement.appendChild( document.createElement( "div" ) );
			return document[DIV] || null;
		}],
		["2.4.1 Make addChildNode() treat DIV elements like HEAD and BODY", () =>
		{
			const DIV = Object.prototype.DIV;
			document.documentElement.appendChild( new DOM( "<div>" ) );
			delete Object.prototype.DIV;
			return document[DIV] || null;
		}],
	] );
	
	test( "document.ownerDocument is null", () =>
		expect( document.ownerDocument === null ).toBe( true ) );
	
	test( "docFrag.ownerDocument is null", () =>
		expect( docFrag.ownerDocument === null ).toBe( true ) );
} );