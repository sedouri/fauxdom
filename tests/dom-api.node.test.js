const {DOM, testEachWithCallback, testEachCallbackResult, printHierarchy, describeNode} = require( "./utils" );

describe( "DOM API, Nodes", () =>
{
	const document = new DOM( "<!DOCTYPE html><html><head><title>Text<body><div class=d TeSt>1<span id=s>2<!--3--></html>" ),
		head = document.head,
		body = document.body,
		div = body.childNodes[0],
		span = div.childNodes[1],
		br = document.createElement( "br" ),
		spanText = span.firstChild,
		comment = span.lastChild,
		parentLess = document.createElement( "div" ),
		bad = document.createElement( "bad" ),
		badAttrs = {attr: "not own property"},
		orderingDoc = new DOM( "<span class=b 1></span><ol><li><span class=b 2></ol><div><span class='a b' 3></div><span class=b 4><span Class=b 5 a=b A=C>" );
	
	parentLess.innerHTML = "<p>text</p>";
	
	bad.attributes = Object.create( badAttrs );
	Object.defineProperty( bad.attributes, Symbol( "symbol" ), {value: true, enumerable: true} );
	Object.defineProperty( bad.attributes, "non-enumerable", {value: true} );
	
	test( "Basic correctness expectations", () =>
	{
		expect( () => new DOM.Node() ).toThrowError();
		
		expect( document.doctype.nodeName ).toBe( document.doctype.name );
		
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
		const shallowClone = document.cloneNode(),
			deepClone = document.cloneNode( true );
		
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
		["3.2.0 insertBefore, move element", () =>
		{
			body.insertBefore( span, div );
		}],
		["3.2.1 insertBefore, before non-element", () =>
		{
			body.insertBefore( span, true );
		}],
		["3.2.2 insertBefore, non-element", () =>
		{
			body.insertBefore( true, span );
		}],
		["3.2.3 insertBefore, from incorrect parent", () =>
		{
			div.appendChild( span );
			body.insertBefore( div, span );
		}],
		["3.3.0 replaceChild, new element", () =>
		{
			body.replaceChild( document.createElement( "b" ), div );
		}],
		["3.3.1 replaceChild, old element", () =>
		{
			body.replaceChild( div, body.childNodes[0] );
		}],
		["3.3.2 replaceChild, non-element", () =>
		{
			body.replaceChild( div, null );
		}],
		["3.3.3 replaceChild, replace element with itself", () =>
		{
			return body.replaceChild( div, div );
		}],
		["3.3.4 replaceChild, replace with non-element", () =>
		{
			body.replaceChild( null, div );
		}],
		["3.3.5 replaceChild, replace BODY with fragment", () =>
		{
			document.documentElement.replaceChild( new DOM( "<body><n>" ), body );
			return document.body;
		}],
		["3.3.REPAIR", () =>
		{
			document.documentElement.replaceChild( body, document.body );
		}],
		["3.4.0 removeChild, HEAD", () =>
		{
			document.documentElement.removeChild( head );
			return document.head;
		}],
		["3.4.1 removeChild, parent-less element", () =>
		{
			return document.documentElement.removeChild( head );
		}],
		["3.4.2 removeChild, non-child", () =>
		{
			return document.documentElement.removeChild( div );
		}],
		["3.4.3 removeChild, non-element", () =>
		{
			return document.documentElement.removeChild( true );
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
			var result = "";
			document.forEach( node =>
			{
				if ( result ) result += "\n";
				result += describeNode( node );
			} );
			return result;
		}],
		["8.1.0 document.forEach( ..., null )", () =>
		{
			var result = "";
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