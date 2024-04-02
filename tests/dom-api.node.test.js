const {DOM, testEachWithCallback, testEachCallbackResult, printHierarchy, describeNode} = require( "./utils" );

describe( "DOM API, Nodes", () =>
{
	const document = new DOM( "<!DOCTYPE html><html><head><title>Text<body><div class=d TeSt>1<span id=s>2<!--3--></html>" );
	const doctype = document.doctype;
	const root = document.querySelector( "html" );
	const head = document.head;
	const body = document.body;
	const div = body.childNodes[0];
	const span = div.childNodes[1];
	const br = document.createElement( "br" );
	const spanText = span.firstChild;
	const comment = span.lastChild;
	const parentLess = document.createElement( "div" );
	const bad = document.createElement( "bad" );
	const badAttrs = {attr: "not own property"};
	const orderingDoc = new DOM( "<span class=b 1></span><ol><li><span class=b 2></ol><div><span class='a b' 3></div><span class=b 4><span Class=b 5 a=b A=C>" );
	
	let insertedElement;
	
	parentLess.innerHTML = "<p>text</p>";
	
	bad.attributes = Object.create( badAttrs );
	Object.defineProperty( bad.attributes, Symbol( "symbol" ), {value: true, enumerable: true} );
	Object.defineProperty( bad.attributes, "non-enumerable", {value: true} );
	
	test( "Basic correctness expectations", () =>
	{
		expect( () => new DOM.Node() ).toThrowError();
		
		expect( doctype.nodeName ).toBe( doctype.name );
		
		expect( div.tagName ).toBe( "DIV" );
		expect( span.tagName ).toBe( "SPAN" );
		
		expect( body.firstChild ).toBe( div );
		expect( div.lastChild ).toBe( span );
		
		expect( span.previousSibling ).toBe( div.firstChild );
		expect( head.nextSibling ).toBe( body );
		expect( div.previousSibling ).toBeNull();
		expect( div.nextSibling ).toBeNull();
		
		expect( spanText.firstChild ).toBeNull();
		expect( spanText.lastChild ).toBeNull();
		
		expect( br.firstChild ).toBeNull();
		expect( br.lastChild ).toBeNull();
		expect( br.previousSibling ).toBeNull();
		expect( br.nextSibling ).toBeNull();
		
		expect( div.id ).toBe( "" );
		expect( div.className ).toBe( "d" );
		expect( span.id ).toBe( "s" );
		expect( span.className ).toBe( "" );
		
		br.id = "id";
		expect( br.id ).toBe( "id" );
		delete br.attributes.id;
		spanText.id = "id";
		expect( spanText.id ).toBe( "" );
	} );
	
	test( "Document cloning", () =>
	{
		const shallowClone = document.cloneNode();
		const deepClone = document.cloneNode( true );
		
		expect( shallowClone ).not.toBe( document );
		expect( deepClone ).not.toBe( document );
		
		expect( printHierarchy( deepClone ) ).toEqual( printHierarchy( document ) );
	} );
	
	testEachWithCallback( document, [
		["0.0 Baseline", () => document],
		["0.1 Baseline BAD", () => bad],
		
		["1.0.0 Get BR.innerHTML", () =>
		{
			return br.innerHTML;
		}],
		["1.0.1 Set BR.innerHTML", () =>
		{
			br.innerHTML = "<b>1";
			return br.innerHTML;
		}],
		["1.0.2 Get BR.outerHTML", () =>
		{
			return br.outerHTML;
		}],
		["1.0.3 Set BR.outerHTML", () =>
		{
			br.outerHTML = "<b>1";
			return br.outerHTML;
		}],
		["1.1.0 Get SPAN.innerHTML", () =>
		{
			return span.innerHTML;
		}],
		["1.1.1 Set SPAN.innerHTML", () =>
		{
			span.innerHTML = "<b>";
			expect( span.firstChild.parentNode ).toBe( span );
			expect( spanText.parentNode ).toBeNull();
			return span;
		}],
		["1.1.2 Set SPAN.innerHTML to null", () =>
		{
			span.innerHTML = null;
			expect( spanText.parentNode ).toBeNull();
			return span;
		}],
		["1.1.3 Repair SPAN", () =>
		{
			span.appendChild( spanText );
			span.appendChild( comment );
			return span;
		}],
		["1.2.0 Get SPAN.outerHTML", () =>
		{
			return span.outerHTML;
		}],
		["1.2.1 Set SPAN.outerHTML", () =>
		{
			span.outerHTML = "<b>";
			expect( span.parentNode ).toBeNull();
			return div;
		}],
		["1.2.2 Repair SPAN.outerHTML", () =>
		{
			div.replaceChild( span, div.lastChild );
			return div;
		}],
		["1.2.3 Set SPAN.outerHTML to null", () =>
		{
			span.outerHTML = null;
			expect( span.parentNode ).toBeNull();
			return div;
		}],
		["1.2.4 Repair SPAN.outerHTML", () =>
		{
			div.appendChild( span );
			return div;
		}],
		["1.3.0 innerHTML of parent-less DIV element", () =>
		{
			return parentLess.innerHTML;
		}],
		["1.3.1 innerHTML of #text node", () =>
		{
			spanText.innerHTML = null;
			return spanText.innerHTML;
		}],
		["1.3.2 Set outerHTML of P in parent-less DIV", () =>
		{
			parentLess.firstChild.outerHTML = "<hr>";
			return parentLess;
		}],
		["1.4.0 Get DIV.textContent", () =>
		{
			return div.textContent;
		}],
		["1.4.1 Get #comment.textContent", () =>
		{
			return comment.textContent;
		}],
		["1.4.2 Set SPAN.textContent to null", () =>
		{
			span.textContent = null;
			return span;
		}],
		["1.4.3 Set SPAN.textContent to true", () =>
		{
			span.textContent = true;
			return span;
		}],
		["1.4.4 Set #comment.textContent", () =>
		{
			comment.textContent = "comment";
			return comment;
		}],
		["1.4.5 Set DOCTYPE.textContent", () =>
		{
			document.doctype.textContent = "text";
			return document.doctype;
		}],
		["1.4.REPAIR", () =>
		{
			span.innerHTML = null;
			span.appendChild( spanText );
			span.appendChild( comment );
			comment.textContent = 3;
		}],
		
		["2.0.0 hasAttributes, document", () => document.hasAttributes()],
		["2.0.1 hasAttributes, BODY", () => body.hasAttributes()],
		["2.0.2 hasAttributes, DIV", () => div.hasAttributes()],
		["2.0.3 hasAttributes, #text node", () => spanText.hasAttributes()],
		["2.0.4 hasAttributes, BAD", () => bad.hasAttributes()],
		["2.1.0 getAttributeNames, document", () => document.getAttributeNames()],
		["2.1.1 getAttributeNames, BODY", () => body.getAttributeNames()],
		["2.1.2 getAttributeNames, DIV", () => div.getAttributeNames()],
		["2.1.3 getAttributeNames, #text node", () => spanText.getAttributeNames()],
		["2.1.4 getAttributeNames, BAD", () => bad.getAttributeNames()],
		["2.2.0 getAttribute, DIV['class']", () => div.getAttribute( "class" )],
		["2.2.1 getAttribute, DIV['id']", () => div.getAttribute( "id" )],
		["2.2.2 getAttribute, DIV[42]", () => div.getAttribute( 42 )],
		["2.2.3 getAttribute, DIV[]", () => div.getAttribute()],
		["2.2.4 getAttribute, #text node['id']", () => spanText.getAttribute( "id" )],
		["2.3.0 setAttribute, DIV['attr'=false]", () =>
		{
			div.setAttribute( "attr", false );
			return div;
		}],
		["2.3.1 setAttribute, DIV['attr'=42]", () =>
		{
			div.setAttribute( "attr", 42 );
			return div;
		}],
		["2.3.2 setAttribute, DIV[42='attr']", () =>
		{
			div.setAttribute( 42, "attr" );
			return div;
		}],
		["2.3.3 setAttribute, DIV['class'=null]", () =>
		{
			div.setAttribute( "class", null );
			return div;
		}],
		["2.3.4 setAttribute, DIV['class'=false]", () =>
		{
			div.setAttribute( "class", false );
			return div;
		}],
		["2.3.5 setAttribute, DIV['class'=true]", () =>
		{
			div.setAttribute( "class", true );
			return div;
		}],
		["2.3.6 setAttribute, DIV['class'='d']", () =>
		{
			div.setAttribute( "class", "d" );
			return div;
		}],
		["2.4.0 toggleAttribute, DIV['id'] on", () =>
		{
			expect( div.toggleAttribute( "id" ) ).toBe( true );
			return div;
		}],
		["2.4.1 toggleAttribute, DIV['id'] forced on", () =>
		{
			expect( div.toggleAttribute( "id", true ) ).toBe( true );
			return div;
		}],
		["2.4.2 toggleAttribute, DIV['attr'] off", () =>
		{
			expect( div.toggleAttribute( "attr" ) ).toBe( false );
			return div;
		}],
		["2.4.3 toggleAttribute, DIV['id'] forced off", () =>
		{
			expect( div.toggleAttribute( "id", false ) ).toBe( false );
			return div;
		}],
		["2.4.4 toggleAttribute, DIV['id'] forced off, again", () =>
		{
			expect( div.toggleAttribute( "id", false ) ).toBe( false );
			return div;
		}],
		["2.4.5 toggleAttribute, DIV[42] forced on", () =>
		{
			expect( div.toggleAttribute( 42, true ) ).toBe( undefined );
			return div;
		}],
		["2.5.0 removeAttribute, SPAN['attr']", () =>
		{
			span.removeAttribute( "attr" );
			return span;
		}],
		["2.5.1 removeAttribute, SPAN['id']", () =>
		{
			span.removeAttribute( "id" );
			return span;
		}],
		["2.5.2 removeAttribute, SPAN['foo']", () =>
		{
			span.removeAttribute( "foo" );
			return span;
		}],
		["2.5.3 removeAttribute, SPAN[42]", () =>
		{
			span.removeAttribute( 42 );
			return span;
		}],
		["2.5.REPAIR", () =>
		{
			span.setAttribute( "id", "s" );
		}],
		["2.6.0 hasAttribute, DIV['class']", () => div.hasAttribute( "class" )],
		["2.6.1 hasAttribute, SPAN['id']", () => span.hasAttribute( "id" )],
		["2.6.2 hasAttribute, DIV['id']", () => div.hasAttribute( "id" )],
		["2.6.3 hasAttribute, DIV['test']", () => div.hasAttribute( "test" )],
		["2.6.4 hasAttribute, DIV[42]", () => div.hasAttribute( 42 )],
		["2.6.5 hasAttribute, #text node['id']", () => spanText.hasAttribute( "id" )],
		
		["3.0.0 hasChildNodes, BODY", () => body.hasChildNodes()],
		["3.0.1 hasChildNodes, DIV", () => div.hasChildNodes()],
		["3.0.2 hasChildNodes, #text node", () => spanText.hasChildNodes()],
		["3.1.0 appendChild, move element", () =>
		{
			body.appendChild( span );
		}],
		["3.1.1 appendChild, new element", () =>
		{
			div.appendChild( br );
		}],
		["3.1.2 appendChild, to self closing element", () =>
		{
			br.appendChild( document.createElement( "div" ) );
		}],
		["3.1.3 appendChild, text string", () =>
		{
			br.appendChild( "New text node" );
		}],
		["3.2.0 insertBefore, new element", () =>
		{
			insertedElement =  document.createElement( "b" );
			body.insertBefore( insertedElement, div );
		}],
		["3.2.1 insertBefore, move element", () =>
		{
			body.insertBefore( span, div );
		}],
		["3.2.2 insertBefore, before non-element", () =>
		{
			body.insertBefore( span, true );
		}],
		["3.2.3 insertBefore, text string", () =>
		{
			body.insertBefore( "New text node", span );
		}],
		["3.2.4 insertBefore, non-element", () =>
		{
			body.insertBefore( true, span );
		}],
		["3.2.5 insertBefore, from incorrect parent", () =>
		{
			div.appendChild( span );
			body.insertBefore( div, span );
		}],
		
		
		["3.3.0 replaceChild, new element", () =>
		{
			body.replaceChild( document.createElement( "c" ), div );
		}],
		["3.3.1 replaceChild, old element", () =>
		{
			body.replaceChild( div, body.childNodes[0] );
		}],
		["3.3.2 replaceChild, text string", () =>
		{
			body.replaceChild( "New text node", div );
			body.replaceChild( div, "New text node" );
		}],
		["3.3.3 replaceChild, non-element", () =>
		{
			body.replaceChild( div, null );
		}],
		["3.3.4 replaceChild, replace element with itself", () =>
		{
			return body.replaceChild( div, div );
		}],
		["3.3.5 replaceChild, replace with non-element", () =>
		{
			body.replaceChild( null, div );
		}],
		["3.3.6 replaceChild, replace BODY with element", () =>
		{
			document.documentElement.replaceChild( document.createElement( "b" ), body );
			expect( document.body == null ).toBe( true );
		}],
		["3.3.7 replaceChild, replace BODY with fragment", () =>
		{
			document.documentElement.replaceChild( body, document.documentElement.childNodes[1] ); // Repair body
			
			const fragment = new DOM( "<body><n>" );
			const fragmentBody = fragment.childNodes[0];
			document.documentElement.replaceChild( fragment, body );
			expect( fragmentBody.tagName ).toBe( "BODY" );
			expect( document.body === fragmentBody ).toBe( true );
		}],
		["3.3.8 replaceChild, replace HEAD with second BODY", () =>
		{
			document.documentElement.replaceChild( body, document.body ); // Repair body
			
			const newBody = document.createElement( "body" );
			document.documentElement.replaceChild( newBody, head );
			
			expect( document.body === body ).toBe( true );
			expect( document.head === head ).toBe( true );
		}],
		["3.3.9 replaceChild, replace HEAD with second BODY from fragment", () =>
		{
			const fragment = new DOM( "<body><n>" );
			const fragmentBody = fragment.childNodes[0];
			document.documentElement.replaceChild( fragment, head );
			
			expect( document.body === fragmentBody ).toBe( false );
			expect( document.body === body ).toBe( true );
			expect( document.head === head ).toBe( true );
		}],
		["3.3.10 replaceChild, replace HEAD with elements from fragment", () =>
		{
			const fragment = new DOM( "<body></body><n>" );
			const fragmentBody = fragment.childNodes[0];
			document.documentElement.replaceChild( fragment, head );
			
			expect( document.body === fragmentBody ).toBe( false );
			expect( document.body === body ).toBe( true );
			expect( document.head === null ).toBe( true );
		}],
		["3.3.11 replaceChild, replace BODY with multiple BODY elements from fragment", () =>
		{
			document.documentElement.replaceChild( head, document.querySelector( "n" ) ); // Repair head
			
			const fragment = new DOM( "<body><n></body><m></m><body>" );
			const fragmentBody = fragment.childNodes[0];
			document.documentElement.replaceChild( fragment, body );
			
			expect( document.body === fragmentBody ).toBe( true );
			expect( document.head === head ).toBe( true );
			expect( fragment.childNodes.length === 1 ).toBe( true );
			expect( fragment.childNodes[0].tagName === "BODY" ).toBe( true );
		}],
		["3.3.12 replaceChild, replace root element", () =>
		{
			const fragment = new DOM( "<body><n></body>" );
			document.replaceChild( fragment, root );
			
			expect( document.documentElement === null ).toBe( true );
			expect( document.head === null ).toBe( true );
			expect( document.body === null ).toBe( true );
		}],
		["3.3.13 replaceChild, replace DOCTYPE", () =>
		{
			document.replaceChild( root, document.childNodes[1] ); // Repair root
			
			const newDoctype = document.createDocumentType( "html", "public" );
			document.replaceChild( newDoctype, doctype );
			
			expect( document.doctype === newDoctype ).toBe( true );
		}],
		["3.3.14 replaceChild, replace DOCTYPE from fragment", () =>
		{
			const fragment = new DOM( '<!doctype html5><html5><head>' );
			const documentElement = fragment.childNodes[1];
			document.replaceChild( fragment, document.childNodes[0] );
			
			expect( document.documentElement === documentElement ).toBe( true );
		}],
		["3.3.15 replaceChild, replace documentElement with second DOCTYPE", () =>
		{
			document.replaceChild( document.createDocumentType( "html" ), document.childNodes[1] );
		}],
		["3.3.16 replaceChild, replace documentElement with fragment with a DOCTYPE", () =>
		{
			const fragment = new DOM( '<!doctype node><node><body>' );
			document.replaceChild( fragment, document.childNodes[1] );
		}],
		["3.3.REPAIR", () =>
		{
			body.insertBefore( insertedElement, div );
			document.replaceChild( doctype, document.doctype );
			document.replaceChild( root, document.childNodes[1] );
			document.documentElement.replaceChild( body, document.body );
			document.documentElement.replaceChild( head, document.head );
			document.documentElement.removeChild( document.querySelector( "html > m" ) );
			
			expect( document.body === body ).toBe( true );
			expect( document.head === head ).toBe( true );
		}],
		
		
		["3.4.0 removeChild, inserted element", () =>
		{
			body.removeChild( insertedElement );
		}],
		["3.4.1 removeChild, HEAD", () =>
		{
			document.documentElement.removeChild( head );
			expect( document.head ).toBe( null );
		}],
		["3.4.2 removeChild, parent-less element", () =>
		{
			return document.documentElement.removeChild( head );
		}],
		["3.4.3 removeChild, non-child", () =>
		{
			return document.documentElement.removeChild( div );
		}],
		["3.4.4 removeChild, non-element", () =>
		{
			return document.documentElement.removeChild( true );
		}],
		["3.4.REPAIR", () =>
		{
			body.insertBefore( insertedElement, div );
			document.documentElement.insertBefore( head, body );
		}],
		
		
		["3.5.0 prepend, one element", () =>
		{
			div.prepend( document.createElement( "h4" ) );
		}],
		["3.5.1 prepend, multiple elements", () =>
		{
			div.prepend( document.createElement( "h1" ), document.createElement( "h2" ), document.createElement( "h3" ) );
		}],
		["3.5.2 prepend, one string", () =>
		{
			insertedElement.prepend( "bold" );
		}],
		["3.5.3 prepend, multiple strings", () =>
		{
			insertedElement.prepend( "This", "text", "is" );
		}],
		["3.5.4 prepend, mix of values", () =>
		{
			insertedElement.prepend( document.createElement( "f" ), false, document.createElement( "g" ), [null, {}, 42, true], document.createElement( "h" ), null, "text node" );
		}],
		["3.5.5 prepend, before documentElement node", () =>
		{
			document.prepend( document.createElement( "f" ) );
		}],
		["3.5.6 prepend, text node", () =>
		{
			div.childNodes[4].prepend( document.createElement( "f" ) );
		}],
		["3.5.REPAIR", () =>
		{
			document.removeChild( document.childNodes[1] );
		}],
		
		
		["3.6.0 append, one element", () =>
		{
			div.append( document.createElement( "h4" ) );
		}],
		["3.6.1 append, multiple elements", () =>
		{
			div.append( document.createElement( "h1" ), document.createElement( "h2" ), document.createElement( "h3" ) );
		}],
		["3.6.2 append, one string", () =>
		{
			insertedElement.append( "bold" );
		}],
		["3.6.3 append, multiple strings", () =>
		{
			insertedElement.append( "This", "text", "is" );
		}],
		["3.6.4 append, mix of values", () =>
		{
			insertedElement.append( document.createElement( "f" ), false, document.createElement( "g" ), [null, {}, 42, true], document.createElement( "h" ), null, "text node" );
		}],
		["3.6.5 append, text node", () =>
		{
			div.childNodes[4].append( document.createElement( "f" ) );
		}],
		
		
		["3.7.0 replaceChildren, one element", () =>
		{
			insertedElement.replaceChildren( document.createElement( "i" ) );
		}],
		["3.7.1 replaceChildren, multiple elements of mixed type", () =>
		{
			const a = document.createElement( "a" );
			a.innerHTML = "<span>link</span>";
			insertedElement.replaceChildren( a, [false], "text" );
		}],
		["3.7.2 replaceChildren, nothing", () =>
		{
			insertedElement.replaceChildren();
		}],
		["3.7.3 replaceChildren, all elements in root element", () =>
		{
			document.documentElement.replaceChildren();
			expect( document.head === null ).toBe( true );
			expect( document.body === null ).toBe( true );
		}],
		["3.7.4 replaceChildren, all elements in root element with simple fragment", () =>
		{
			document.documentElement.replaceChildren( head, body ); // Repair
			expect( document.head === head ).toBe( true );
			expect( document.body === body ).toBe( true );
			
			const fragment = new DOM( '<node>' );
			document.documentElement.replaceChildren( fragment );
			expect( document.head === null ).toBe( true );
			expect( document.body === null ).toBe( true );
		}],
		["3.7.5 replaceChildren, all elements in root element with fragment", () =>
		{
			const fragment = new DOM( '<!doctype node><node><body>' );
			document.documentElement.replaceChildren( fragment );
			expect( document.head === null ).toBe( true );
			expect( document.body === null ).toBe( true );
		}],
		["3.7.6 replaceChildren, whole document with fragment", () =>
		{
			const fragment = new DOM( '<!doctype node><node><body>' );
			const doctype = fragment.childNodes[0];
			document.replaceChildren( fragment );
			
			expect( document.doctype === doctype ).toBe( true );
			expect( document.head === null ).toBe( true );
			expect( document.body === document.childNodes[1].childNodes[0] ).toBe( true );
		}],
		["3.7.REPAIR", () =>
		{
			document.replaceChildren( root );
			expect( document.doctype === null ).toBe( true );
			document.doctype = doctype;
			root.replaceChildren( head, body );
			expect( document.head === head ).toBe( true );
			expect( document.body === body ).toBe( true );
		}],
		["3.7.7 replaceChildren, text node", () =>
		{
			div.childNodes[4].replaceChildren( document.createElement( "f" ) );
		}],
		
		
		["3.8.0 before, one element", () =>
		{
			div.before( document.createElement( "h4" ) );
		}],
		["3.8.1 before, multiple elements", () =>
		{
			div.before( document.createElement( "h1" ), document.createElement( "h2" ), document.createElement( "h3" ) );
		}],
		["3.8.2 before, one string", () =>
		{
			insertedElement.before( "bold" );
		}],
		["3.8.3 before, multiple strings", () =>
		{
			insertedElement.before( "This", "text", "is" );
		}],
		["3.8.4 before, mix of values", () =>
		{
			insertedElement.before( document.createElement( "f" ), false, document.createElement( "g" ), [null, {}, 42, true], document.createElement( "h" ), null, "text node" );
		}],
		["3.8.5 before, before documentElement node", () =>
		{
			document.documentElement.before( document.createElement( "f" ) );
		}],
		["3.8.6 before, before DOCTYPE node", () =>
		{
			document.doctype.before( document.createElement( "e" ) );
		}],
		["3.8.7 before, parent-less node", () =>
		{
			div.parentNode.removeChild( div );
			expect( div.parentNode == null ).toBe( true );
			
			div.before( document.createElement( "e" ) );
		}],
		["3.8.REPAIR", () =>
		{
			document.removeChild( document.childNodes[1] );
			document.removeChild( document.childNodes[1] );
			document.body.replaceChildren( insertedElement, div, document.createElement( "c" ) );
		}],
		
		
		["3.9.0 after, one element", () =>
		{
			div.after( document.createElement( "h4" ) );
		}],
		["3.9.1 after, multiple elements", () =>
		{
			div.after( document.createElement( "h1" ), document.createElement( "h2" ), document.createElement( "h3" ) );
		}],
		["3.9.2 after, one string", () =>
		{
			insertedElement.after( "bold" );
		}],
		["3.9.3 after, multiple strings", () =>
		{
			insertedElement.after( "This", "text", "is" );
		}],
		["3.9.4 after, mix of values", () =>
		{
			insertedElement.after( document.createElement( "f" ), false, document.createElement( "g" ), [null, {}, 42, true], document.createElement( "h" ), null, "text node" );
		}],
		["3.9.5 after, after documentElement node", () =>
		{
			document.documentElement.after( document.createElement( "f" ) );
		}],
		["3.9.6 after, parent-less node", () =>
		{
			div.parentNode.removeChild( div );
			expect( div.parentNode == null ).toBe( true );
			
			div.after( document.createElement( "e" ) );
		}],
		["3.9.7 after, place fragment after its own root node", () =>
		{
			const fragment = new DOM( '<!doctype node><node><body>' );
			fragment.childNodes[1].after( fragment );
			return fragment;
		}],
		["3.9.REPAIR", () =>
		{
			document.removeChild( document.childNodes[2] );
			document.body.replaceChildren( insertedElement, div, document.createElement( "c" ) );
		}],
		
		
		["3.10.0 replaceWith, new element", () =>
		{
			div.replaceWith( document.createElement( "d" ) );
		}],
		["3.10.1 replaceWith, old element", () =>
		{
			body.childNodes[1].replaceWith( div );
		}],
		["3.10.2 replaceWith, text string", () =>
		{
			div.replaceWith( "New text node" );
		}],
		["3.10.3 replaceWith, mix of values", () =>
		{
			body.childNodes[1].replaceWith( 42, "text", div, [true, null, false], null );
		}],
		["3.10.4 replaceWith, replace element with itself", () =>
		{
			div.replaceWith( div );
		}],
		["3.10.5 replaceWith, replace with single, non-node value", () =>
		{
			div.replaceWith( null );
		}],
		["3.10.6 replaceWith, replace with nothing", () =>
		{
			body.childNodes[3].replaceWith();
		}],
		["3.10.7 replaceWith, parent-less node", () =>
		{
			expect( div.parentNode == null ).toBe( true );
			
			div.replaceWith( document.createElement( "e" ) );
		}],
		["3.10.8 replaceWith, replace BODY with element", () =>
		{
			body.replaceWith( document.createElement( "b" ) );
			expect( document.body == null ).toBe( true );
		}],
		["3.10.9 replaceWith, replace BODY with fragment", () =>
		{
			document.documentElement.childNodes[1].replaceWith( body ); // Repair body
			
			const fragment = new DOM( "<body><n>" );
			const fragmentBody = fragment.childNodes[0];
			body.replaceWith( fragment );
			expect( fragmentBody.tagName ).toBe( "BODY" );
			expect( document.body === fragmentBody ).toBe( true );
		}],
		["3.10.10 replaceWith, replace HEAD with second BODY", () =>
		{
			document.body.replaceWith( body ); // Repair body
			
			const newBody = document.createElement( "body" );
			head.replaceWith( newBody );
			
			expect( document.body === body ).toBe( true );
			// `replaceWith` removes the HEAD node and doesn't put anything in its place.
			expect( document.head === null ).toBe( true );
		}],
		["3.10.11 replaceWith, replace HEAD with second BODY from fragment", () =>
		{
			body.before( head ); // Repair head
			expect( document.head === head ).toBe( true );
			
			const fragment = new DOM( "<body><n>" );
			const fragmentBody = fragment.childNodes[0];
			head.replaceWith( fragment );
			
			expect( document.body === fragmentBody ).toBe( false );
			expect( document.body === body ).toBe( true );
			expect( document.head === null ).toBe( true );
		}],
		["3.10.12 replaceWith, replace HEAD with elements from fragment", () =>
		{
			body.before( head ); // Repair head
			expect( document.head === head ).toBe( true );
			
			const fragment = new DOM( "<body></body><n>" );
			const fragmentBody = fragment.childNodes[0];
			head.replaceWith( fragment );
			
			expect( document.body === fragmentBody ).toBe( false );
			expect( document.body === body ).toBe( true );
			expect( document.head === null ).toBe( true );
		}],
		["3.10.13 replaceWith, replace BODY with multiple BODY elements from fragment", () =>
		{
			document.querySelector( "n" ).replaceWith( head ); // Repair head
			
			const fragment = new DOM( "<body><n></body><m></m><body>" );
			const fragmentBody = fragment.childNodes[0];
			body.replaceWith( fragment );
			
			expect( document.body === fragmentBody ).toBe( true );
			expect( document.head === head ).toBe( true );
			expect( fragment.childNodes.length === 1 ).toBe( true );
			expect( fragment.childNodes[0].tagName === "BODY" ).toBe( true );
		}],
		["3.10.14 replaceWith, replace BODY with multiple BODY elements", () =>
		{
			document.body.replaceWith( body ); // Repair body
			expect( document.body === body ).toBe( true );
			document.documentElement.removeChild( document.documentElement.childNodes[2] );
			
			const fragment = new DOM( "<body><n></body><m></m><body>" );
			const fragmentBody = fragment.childNodes[0];
			body.replaceWith( ...fragment.childNodes );
			
			expect( document.body === fragmentBody ).toBe( true );
			expect( document.head === head ).toBe( true );
			expect( fragment.childNodes.length === 1 ).toBe( true );
			expect( fragment.childNodes[0].tagName === "BODY" ).toBe( true );
		}],
		["3.10.15 replaceWith, replace root element", () =>
		{
			const fragment = new DOM( "<body><n></body>" );
			root.replaceWith( fragment );
			
			expect( document.documentElement === null ).toBe( true );
			expect( document.head === null ).toBe( true );
			expect( document.body === null ).toBe( true );
		}],
		["3.10.16 replaceWith, replace DOCTYPE", () =>
		{
			document.childNodes[1].replaceWith( root ); // Repair root
			
			const newDoctype = document.createDocumentType( "html", "public" );
			doctype.replaceWith( newDoctype );
			
			expect( document.doctype === newDoctype ).toBe( true );
		}],
		["3.10.17 replaceWith, replace DOCTYPE from fragment", () =>
		{
			const fragment = new DOM( '<!doctype html5><html5><head>' );
			const documentElement = fragment.childNodes[1];
			document.childNodes[0].replaceWith( fragment );
			
			expect( document.documentElement === documentElement ).toBe( true );
		}],
		["3.10.18 replaceWith, replace documentElement with second DOCTYPE", () =>
		{
			document.childNodes[1].replaceWith( document.createDocumentType( "html" ) );
		}],
		["3.10.19 replaceWith, replace documentElement with fragment with a DOCTYPE", () =>
		{
			const fragment = new DOM( '<!doctype node><node><body>' );
			document.childNodes[1].replaceWith( fragment );
		}],
		["3.10.REPAIR", () =>
		{
			body.replaceChildren( insertedElement, div, document.createElement( "c" ) );
			document.doctype.replaceWith( doctype );
			document.childNodes[1].replaceWith( root );
			document.body.replaceWith( body );
			document.head.replaceWith( head );
			document.documentElement.removeChild( document.querySelector( "html > m" ) );
			
			expect( document.body === body ).toBe( true );
			expect( document.head === head ).toBe( true );
		}],
		
		
		["3.11.0 remove, inserted element", () =>
		{
			insertedElement.remove();
		}],
		["3.11.1 remove, HEAD", () =>
		{
			head.remove();
			expect( document.head === null ).toBe( true );
		}],
		["3.11.2 remove, parent-less element", () =>
		{
			insertedElement.remove();
			head.remove();
		}],
		["3.11.REPAIR", () =>
		{
			div.querySelectorAll( "h1, h2, h3, h4" ).forEach( node => node.remove() );
			document.documentElement.insertBefore( head, body );
		}],
		
		
		["4.0.0 Set document.className", () =>
		{
			document.className = "a b cde";
		}],
		["4.0.1 Set BR.className", () =>
		{
			br.className = "a b cde";
			return br;
		}],
		["4.1.0 Set BR['class']", () =>
		{
			br.setAttribute( "class", "c d e" );
			return br.className;
		}],
		["4.1.1 Remove BR['class']", () =>
		{
			br.removeAttribute( "class" );
			return br.className;
		}],
		["4.2.0 classList of #text node", () =>
		{
			return spanText.classList;
		}],
		["4.2.1 DIV.classList", () =>
		{
			return Array.prototype.slice.call( div.classList );
		}],
		["4.2.2 Set DIV.classList.length", () =>
		{
			div.classList.length = 0;
			return Array.prototype.slice.call( div.classList );
		}],
		["4.2.3 BR.classList with enumerable, inherited property", () =>
		{
			const DOMTokenList_prototype = Reflect.getPrototypeOf( br.classList );
			DOMTokenList_prototype[1] = "b";
			br.classList.value = "a";
			br.classList.value = null;
			expect( br.classList[1] ).toBe( "b" );
			expect( br.classList.item( 1 ) ).toBe( undefined );
			expect( br.classList.contains( "b" ) ).toBe( false );
			delete DOMTokenList_prototype[1];
			return br;
		}],
		["4.3.0 new DOMTokenList", () =>
		{
			const DOMTokenList = Reflect.getPrototypeOf( div.classList ).constructor;
			expect( () => new DOMTokenList() ).toThrowErrorMatchingSnapshot();
		}],
		["4.4.0 DOMTokenList.add( 'class' )", () =>
		{
			br.classList.add( "class" );
			return br;
		}],
		["4.4.1 DOMTokenList.add( 'a b' )", () =>
		{
			br.classList.add( "a b" );
			return br;
		}],
		["4.4.2 DOMTokenList.add( 'a', 'b' )", () =>
		{
			br.classList.add( "a", "b" );
			return br;
		}],
		["4.4.3 DOMTokenList.add( 42 )", () =>
		{
			br.classList.add( 42 );
			return br;
		}],
		["4.5.0 DOMTokenList.remove( 'class' )", () =>
		{
			br.classList.remove( "class" );
			return br;
		}],
		["4.5.1 DOMTokenList.remove( 'a b' )", () =>
		{
			br.classList.remove( "a b" );
			return br;
		}],
		["4.5.2 DOMTokenList.remove( 'a', 'b' )", () =>
		{
			br.classList.remove( "a", "b" );
			return br;
		}],
		["4.5.3 DOMTokenList.remove( 42 )", () =>
		{
			br.classList.remove( 42 );
			return br;
		}],
		["4.6.0 DOMTokenList.item( 0 )", () =>
		{
			return br.classList.item( 0 ) || null;
		}],
		["4.6.1 DOMTokenList.item( 0 )", () =>
		{
			br.classList[0] = "a";
			return br.classList.item( 0 ) || null;
		}],
		["4.6.2 DOMTokenList.item( 0 )", () =>
		{
			br.classList.add( "b" );
			return br.classList.item( 0 );
		}],
		["4.6.3 DOMTokenList.item( 1 )", () =>
		{
			return br.classList.item( 1 ) || null;
		}],
		["4.7.0 DOMTokenList.toggle( 'a' )", () =>
		{
			expect( br.classList.toggle( "a" ) ).toBe( true );
			return br;
		}],
		["4.7.1 DOMTokenList.toggle( 'a' )", () =>
		{
			expect( br.classList.toggle( "a" ) ).toBe( false );
			return br;
		}],
		["4.7.2 DOMTokenList.toggle( 'b', true )", () =>
		{
			expect( br.classList.toggle( "b", true ) ).toBe( true );
			return br;
		}],
		["4.7.3 DOMTokenList.toggle( 'a', false )", () =>
		{
			expect( br.classList.toggle( "a", false ) ).toBe( false );
			return br;
		}],
		["4.7.4 DOMTokenList.toggle( 'b', false )", () =>
		{
			expect( br.classList.toggle( "b", false ) ).toBe( false );
			return br;
		}],
		["4.7.5 DOMTokenList.toggle( 42 )", () =>
		{
			expect( br.classList.toggle( 42 ) ).toBe( false );
			return br;
		}],
		["4.8.0 DOMTokenList.replace( 'a', 'b' )", () =>
		{
			expect( br.classList.replace( "a", "b" ) ).toBe( false );
			return br;
		}],
		["4.8.1 DOMTokenList.replace( 'a', 'b' )", () =>
		{
			br.classList.add( "a" );
			expect( br.classList.replace( "a", "b" ) ).toBe( true );
			return br;
		}],
		["4.8.2 DOMTokenList.replace( 'a', 'b' )", () =>
		{
			br.classList.add( "a" );
			expect( br.classList.replace( "a", "b" ) ).toBe( true );
			return br;
		}],
		["4.8.3 DOMTokenList.replace( '', 'a' )", () =>
		{
			expect( br.classList.replace( "", "a" ) ).toBe( false );
			return br;
		}],
		["4.8.4 DOMTokenList.replace( null, 'a' )", () =>
		{
			expect( br.classList.replace( null, "a" ) ).toBe( false );
			return br;
		}],
		
		["5.0.0 getElementById( 's' )", () =>
		{
			return document.getElementById( "s" );
		}],
		["5.0.1 getElementById( 42 )", () =>
		{
			return document.getElementById( 42 );
		}],
		["5.0.2 getElementById()", () =>
		{
			return document.getElementById();
		}],
		["5.0.3 #text.getElementById( 's' )", () =>
		{
			return spanText.getElementById( "s" );
		}],
		["5.1.0 getElementsByClassName( 'b' )", () =>
		{
			return orderingDoc.getElementsByClassName( "b" );
		}],
		["5.1.1 getElementsByClassName( 42 )", () =>
		{
			return document.getElementsByClassName( 42 );
		}],
		["5.1.2 getElementsByClassName()", () =>
		{
			return document.getElementsByClassName();
		}],
		["5.1.3 #text.getElementsByClassName( 'b' )", () =>
		{
			return spanText.getElementsByClassName( "b" );
		}],
		["5.1.4 getElementsByClassName( 'a b' )", () =>
		{
			return orderingDoc.getElementsByClassName( "a b" );
		}],
		["5.1.5 getElementsByClassName( 'a B' )", () =>
		{
			return orderingDoc.getElementsByClassName( "a B" );
		}],
		["5.1.6 getElementsByClassName( 'a b c' )", () =>
		{
			return orderingDoc.getElementsByClassName( "a b c" );
		}],
		["5.1.7 getElementsByClassName( 'b a' )", () =>
		{
			return orderingDoc.getElementsByClassName( "b a" );
		}],
		["5.1.8 getElementsByClassName( ' ' )", () =>
		{
			return orderingDoc.getElementsByClassName( " " );
		}],
		["5.2.0 getElementsByTagName( 'span' )", () =>
		{
			return orderingDoc.getElementsByTagName( "span" );
		}],
		["5.2.1 getElementsByTagName( 42 )", () =>
		{
			return document.getElementsByTagName( 42 );
		}],
		["5.2.2 getElementsByTagName()", () =>
		{
			return document.getElementsByTagName();
		}],
		["5.2.3 #text.getElementsByTagName( 'span' )", () =>
		{
			return spanText.getElementsByTagName( "span" );
		}],
		
		["6.0.0 createCDATASection()", () =>
		{
			return document.createCDATASection();
		}],
		["6.1.0 createCDATASection( 'data' )", () =>
		{
			return document.createCDATASection( "data" );
		}],
		["6.2.0 createCDATASection( 'data]]>' )", () =>
		{
			try {document.createCDATASection( "data]]>" )}
			catch ( err ) {return err}
		}],
		
		["7.0.0 createProcessingInstruction( 'target' )", () =>
		{
			return document.createProcessingInstruction( "target" );
		}],
		["7.0.1 createProcessingInstruction( 'T-5\\u2040:\\u0342\\u203F' )", () =>
		{
			return document.createProcessingInstruction( "T-5\u2040:\u0342\u203F" );
		}],
		["7.0.2 createProcessingInstruction( '\\xC9' )", () =>
		{
			return document.createProcessingInstruction( "\xC9" );
		}],
		["7.0.3 createProcessingInstruction( '\\xE0' )", () =>
		{
			return document.createProcessingInstruction( "\xE0" );
		}],
		["7.0.4 createProcessingInstruction( '\\u0100' )", () =>
		{
			return document.createProcessingInstruction( "\u0100" );
		}],
		["7.0.5 createProcessingInstruction( '\\u0379' )", () =>
		{
			return document.createProcessingInstruction( "\u0379" );
		}],
		["7.0.6 createProcessingInstruction( '\\u1000' )", () =>
		{
			return document.createProcessingInstruction( "\u1000" );
		}],
		["7.0.7 createProcessingInstruction( '\\u200C' )", () =>
		{
			return document.createProcessingInstruction( "\u200C" );
		}],
		["7.0.8 createProcessingInstruction( '\\u200D' )", () =>
		{
			return document.createProcessingInstruction( "\u200D" );
		}],
		["7.0.9 createProcessingInstruction( '\\u2100' )", () =>
		{
			return document.createProcessingInstruction( "\u2100" );
		}],
		["7.0.10 createProcessingInstruction( '\\u2B2B' )", () =>
		{
			return document.createProcessingInstruction( "\u2B2B" );
		}],
		["7.0.11 createProcessingInstruction( '\\uBABA' )", () =>
		{
			return document.createProcessingInstruction( "\uBABA" );
		}],
		["7.0.12 createProcessingInstruction( '\\uFAFA' )", () =>
		{
			return document.createProcessingInstruction( "\uFAFA" );
		}],
		["7.0.13 createProcessingInstruction( '\\uFEFE' )", () =>
		{
			return document.createProcessingInstruction( "\uFEFE" );
		}],
		["7.1.0 createProcessingInstruction( 'target', 'data' )", () =>
		{
			return document.createProcessingInstruction( "target", "data" );
		}],
		["7.2.0 createProcessingInstruction()", () =>
		{
			try {document.createProcessingInstruction()}
			catch ( err ) {return err}
		}],
		["7.2.1 createProcessingInstruction( 'target', 'data?>' )", () =>
		{
			try {document.createProcessingInstruction( "target", "data?>" )}
			catch ( err ) {return err}
		}],
		["7.2.2 createProcessingInstruction( '9target', 'data' )", () =>
		{
			try {document.createProcessingInstruction( "9target", "data" )}
			catch ( err ) {return err}
		}],
		["7.2.3 createProcessingInstruction( 'target(0)', 'data' )", () =>
		{
			try {document.createProcessingInstruction( "target(0)", "data" )}
			catch ( err ) {return err}
		}],
		["7.2.4 createProcessingInstruction( '', 'data' )", () =>
		{
			try {document.createProcessingInstruction( "", "data" )}
			catch ( err ) {return err}
		}],
		
		["8.0.0 document.forEach( ... )", () =>
		{
			let result = "";
			document.forEach( node =>
			{
				if ( result ) result += "\n";
				result += describeNode( node );
			} );
			return result;
		}],
		["8.1.0 document.forEach( ..., null )", () =>
		{
			let result = "";
			document.forEach( node =>
			{
				if ( result ) result += "\n";
				result += describeNode( node );
			}, null );
			return result;
		}],
	] );

	describe( "Document with {lowerAttributeCase: true}", () =>
	{
		const lowerCaseDoc = new DOM( "<div Class=d TeSt></div><span Class=b ATTR id=s a=b A=C>", {lowerAttributeCase: true} ),
			div = lowerCaseDoc.childNodes[0],
			span = lowerCaseDoc.childNodes[1];
		
		testEachCallbackResult( [
			["1.0.0 getAttributeNames, DIV", () => div.getAttributeNames()],
			["1.0.1 getAttributeNames, SPAN", () => span.getAttributeNames()],
			["1.1.0 getAttribute, DIV['class']", () => div.getAttribute( "class" )],
			["1.1.1 getAttribute, DIV['id']", () => div.getAttribute( "id" )],
			["1.2.0 setAttribute, DIV['Attr'=42]", () =>
			{
				div.setAttribute( "Attr", 42 );
				return div;
			}],
			["1.3.0 toggleAttribute, DIV['ID'] on", () =>
			{
				expect( div.toggleAttribute( "ID" ) ).toBe( true );
				return div;
			}],
			["1.3.1 toggleAttribute, DIV['ID'] forced on", () =>
			{
				expect( div.toggleAttribute( "ID", true ) ).toBe( true );
				return div;
			}],
			["1.3.2 toggleAttribute, DIV['attR'] off", () =>
			{
				expect( div.toggleAttribute( "attR" ) ).toBe( false );
				return div;
			}],
			["1.3.3 toggleAttribute, DIV['id'] forced off", () =>
			{
				expect( div.toggleAttribute( "id", false ) ).toBe( false );
				return div;
			}],
			["1.3.4 toggleAttribute, DIV['ID'] forced off, again", () =>
			{
				expect( div.toggleAttribute( "ID", false ) ).toBe( false );
				return div;
			}],
			["1.3.5 toggleAttribute, DIV[42] forced on", () =>
			{
				expect( div.toggleAttribute( 42, true ) ).toBe( undefined );
				return div;
			}],
			["1.4.0 removeAttribute, SPAN['attr']", () =>
			{
				span.removeAttribute( "attr" );
				return span;
			}],
			["1.4.1 removeAttribute, SPAN['ID']", () =>
			{
				span.removeAttribute( "ID" );
				return span;
			}],
			
			["2.0.0 getElementsByClassName( 'b' )", () =>
			{
				return lowerCaseDoc.getElementsByClassName( "b" );
			}],
		]);
	} );
} );

test( "Replacing node during forEach()", () =>
{
	const document = new DOM( `<html>
		<body>
			<?js "<div>"+ 42 +"</div>"?>
			<div>
				<span><?js "<b>hello</b><i></i>"?>, </span>
				<?js "world"?>
				<?js "<?js \\"this won't be evaluated\\"?"+">"?>
				<?js "<div></div><?js \\"this won't be evaluated either\\"?"+">"?>
			</div>
		</body>
	</html>`, {allowProcessingInstructions: true, trimWhitespace: true} );
	
	document.forEach( node =>
	{
		if ( node.target === "js" )
			node.outerHTML = eval( node.textContent );
	}, DOM.Node.PROCESSING_INSTRUCTION_NODE );
	
	expect( printHierarchy( document ) ).toMatchSnapshot();
} );