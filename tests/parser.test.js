import {DOM, testEachWithHTML} from "./utils.js"

const emptyDocument = "<html><head></head><body></body></html>";

describe( "Parser", () =>
{
	describe( "Tags", () =>
	{
		testEachWithHTML( new DOM( null ), [
			["Lower case", "<div></div>"],
			["Upper case", "<DIV></DIV>"],
			["Mixed case", "<DiV></dIv>"],
			
			["Invalid tag name", "<42></42>"],
			
			["Self closing", "<input>text"],
			["Self closing, with unnecessary end tag", "<input>text</input>"],
			["Self closing, with enclosed unnecessary end tag", "<input>text<span>2</input>3</span>"],
			
			["Self closing DIV inside not self closing DIV", "<div><div/>inner</div>outer"],
			
			["Close without open", "<span></div>"],
			
			["Auto-close multiple inner tags", "<div><span>1<span>2<span>3</div>4"],
			["Auto-close multiple inner tags, without an open tag", "<span>1<span>2<span>3</div>4"],
			
			["SCRIPT tag contents", "<script>if ( 1 < 2 && 2 > 1 )\n\tj( '&amp;' );</script>"],
			
			["Multiple SCRIPT tags", "<script>1</script><script>2</script>"],
			["Multiple SCRIPT tags, with missing end tag", "<script>1<script>2</script>"],
			["Multiple SCRIPT tags, with missing end tag", "<script>1</script><script>2"],
			
			["STYLE tag contents", "<style> p > l {} </style>"],
		] );
	} );
	
	describe( "Tag boundaries", () =>
	{
		function closes( a, b, closes = true )
		{
			return [`${a.toUpperCase()} ${closes ? "closes" : "doesn't close"} ${b.toUpperCase()}`, `<${b}>1<${a}>2</${a}></${b}>`];
		}
		
		testEachWithHTML( new DOM( null ), [
			closes( "address", "p" ),
			closes( "article", "p" ),
			closes( "aside", "p" ),
			closes( "blockquote", "p" ),
			closes( "div", "p" ),
			closes( "dl", "p" ),
			closes( "fieldset", "p" ),
			closes( "footer", "p" ),
			closes( "form", "p" ),
			closes( "h1", "p" ),
			closes( "h2", "p" ),
			closes( "h3", "p" ),
			closes( "h4", "p" ),
			closes( "h5", "p" ),
			closes( "h6", "p" ),
			closes( "header", "p" ),
			closes( "hgroup", "p" ),
			closes( "hr", "p" ),
			closes( "main", "p" ),
			closes( "nav", "p" ),
			closes( "ol", "p" ),
			closes( "p", "p" ),
			closes( "pre", "p" ),
			closes( "section", "p" ),
			closes( "table", "p" ),
			closes( "ul", "p" ),
			
			closes( "body", "head" ),
			
			closes( "dd", "dt" ),
			closes( "dd", "dd" ),
			closes( "dt", "dt" ),
			closes( "dt", "dd" ),
			
			closes( "tbody", "tbody" ),
			closes( "tbody", "thead" ),
			closes( "tbody", "tfoot" ),
			closes( "thead", "tbody" ),
			closes( "thead", "thead" ),
			closes( "thead", "tfoot" ),
			closes( "td", "td" ),
			closes( "td", "th" ),
			closes( "tfoot", "tbody" ),
			closes( "tfoot", "thead" ),
			closes( "tfoot", "tfoot" ),
			closes( "th", "td" ),
			closes( "th", "th" ),
			closes( "tr", "tr" ),
			closes( "td", "tr", false ),
			closes( "tr", "tbody", false ),
			
			closes( "li", "li" ),
			closes( "li", "ol", false ),
			closes( "li", "ul", false ),
			
			closes( "button", "button" ),
			closes( "button", "datalist" ),
			closes( "button", "optgroup" ),
			closes( "button", "option" ),
			closes( "button", "progress" ),
			closes( "button", "select" ),
			closes( "button", "textarea" ),
			
			closes( "datalist", "button" ),
			closes( "input", "button" ),
			closes( "output", "button" ),
			closes( "progress", "button" ),
			closes( "select", "button" ),
			closes( "textarea", "button" ),
			
			closes( "optgroup", "optgroup" ),
			closes( "optgroup", "option" ),
			closes( "option", "option" ),
			closes( "option", "optgroup", false ),
		] );
	} );
	
	describe( "Attributes", () =>
	{
		testEachWithHTML( new DOM( null ), [
			["Single, normal", '<div id="1">'],
			["Single, unquoted", "<div id=1>"],
			["Single, no value", "<div id>"],
			
			["Multiple, normal", '<div id="1" name="2">'],
			["Multiple, unquoted", "<div id=1 name=2>"],
			["Multiple, no value", "<div id name>"],
			
			["Duplicate", "<div id=1 id=2 id>"],
			["Duplicate, mixed case", "<div id=1 ID=2 Id>"],
		] );
	} );
	
	describe( "DOCTYPE parsing", () =>
	{
		testEachWithHTML( new DOM( null ), [
			["Public DOCTYPE", '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">'+ emptyDocument],
			["System DOCTYPE", '<!DOCTYPE html SYSTEM "http://www.w3.org/TR/html4/loose.dtd">'+ emptyDocument],
			["Full DOCTYPE", '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'+ emptyDocument],
			
			["Double DOCTYPE", '<!DOCTYPE html><!DOCTYPE html PUBLIC "name">'+ emptyDocument],
			["Double DOCTYPE", '<!DOCTYPE html PUBLIC "name"><!DOCTYPE html>'+ emptyDocument],
			
			["After comment", "<!-- comment --><!DOCTYPE html>"],
			["After element", "<div></div><!DOCTYPE html>"],
			
			["Mixed case", "<!DoCtYpE html>"+ emptyDocument],
		] );
	} );
	
	describe( "Element adoption", () =>
	{
		testEachWithHTML( new DOM( null ), [
			["Elements before HTML tag", "<!DOCTYPE html><meta>"+ emptyDocument],
			["Elements after HTML tag", "<!DOCTYPE html>"+ emptyDocument +"<div></div>"],
			["Elements before & after HTML tag", "<!DOCTYPE html><meta>"+ emptyDocument +"<div></div>"],
			
			["HEAD elements before HTML tag without a HEAD", "<!DOCTYPE html><meta><html><body></body></html>"],
			["BODY elements after HTML tag without a BODY", "<!DOCTYPE html><html><head></head></html><div></div>"],
			["Elements before & after HTML tag without a HEAD or BODY", "<!DOCTYPE html><meta><html></html><div></div>"],
		] );
	} );
	
	describe( "Element nesting", () =>
	{
		testEachWithHTML( new DOM( null ), [
			["UL inside UL", "<ul><li><ul><li></li></ul></li></ul>"],
		] );
	} );
	
	describe( "allowSelfClosingSyntax: true", () =>
	{
		testEachWithHTML( new DOM( null, {allowSelfClosingSyntax: true} ), [
			["Well formed", "<div/>text"],
			["Well formed, with attribute", '<div id="1"/>text'],
			["Well formed, with unquoted attribute", "<div id=1/>text"],
			["Well formed, with value-less attribute", "<div id/>text"],
			
			["Self closing DIV inside not self closing DIV", "<div><div/>inner</div>outer"],
		] );
	} );
	
	describe( "allowCDATA: true", () =>
	{
		testEachWithHTML( new DOM( null, {allowCDATA: true} ), [
			["Well formed", "<![CDATA[ data ]]>text"],
			
			["Incorrect end", "<![CDATA[ data ] ]>text"],
			["Incorrect end", "<![CDATA[ data ]] >text"],
			["Incorrect end", "<![CDATA[ data ]>text"],
			["Incorrect end", "<![CDATA[ data >text"],
			["Incorrect end", "<![CDATA[ data ]text"],
			["Incorrect end", "<![CDATA[ data ]]text"],
			
			["Well formed, with double end", "<![CDATA[ data ]]>]]>text"],
		] );
	} );
	
	describe( "allowProcessingInstructions: true", () =>
	{
		testEachWithHTML( new DOM( null, {allowProcessingInstructions: true} ), [
			["Well formed", "<?target data?>text"],
			["Well formed, with no data", "<?target?>text"],
			
			["Incorrect target", "<?.target data?>text"],
			["Incorrect target", "<?target(0) data?>text"],
			
			["Incorrect end", "<?target data? >text"],
			["Incorrect end", "<?target data>text"],
			
			["Well formed, with double end", "<?target data?>?>text"],
		] );
	} );
	
	describe( "trimWhitespace: true", () =>
	{
		testEachWithHTML( new DOM( null, {trimWhitespace: true} ), [
			["Whitespace removal", "\n<div>\n\t<span>This <b>will</b> be odd</span>\n</div>\n"],
		] );
	} );
	
	describe( "collapseWhitespace: true", () =>
	{
		testEachWithHTML( new DOM( null, {collapseWhitespace: true} ), [
			["Whitespace removal", "\n<div>\n\t<span>This <b>will</b><span> </span>be fine</span>\n</div>\n"],
		] );
	} );
	
	describe( "lowerAttributeCase: true", () =>
	{
		testEachWithHTML( new DOM( null, {lowerAttributeCase: true} ), [
			["Duplicate, mixed case", "<div id=1 ID=2 Id>"],
		] );
	} );
} );

// https://html.spec.whatwg.org/multipage/parsing.html#parse-errors
describe( "WHATWG HTML5 Spec 12.2.2 Parse errors", () =>
{
	const document = new DOM( null, {decodeEntities: true} );
	document.importStandardEntities();
	testEachWithHTML( document, [
		["abrupt-closing-of-empty-comment", "<!-->text"],
		["abrupt-closing-of-empty-comment", "<!--->text"],
		
		["abrupt-doctype-public-identifier", '<!DOCTYPE html PUBLIC "foo>'],
		
		["abrupt-doctype-system-identifier", '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "foo>'],
		
		["absence-of-digits-in-numeric-character-reference", "&#qux;&#32;&amp;"],
		
		["cdata-in-html-content", "<![CDATA[ data ]]>text"],
		
		// Is there a way to test this?
		//["character-reference-outside-unicode-range", ""],
		
		["control-character-in-input-stream", "\x00\x02"],
		
		// This doesn't follow the spec.
		//["control-character-reference", "\x80"],
		
		["end-tag-with-attributes", "<div></div style>"],
		
		["duplicate-attribute", "<div style=1 style=2></div>"],
		
		["end-tag-with-trailing-solidus", "<div>inner</div/>outer"],
		
		["eof-before-tag-name", "<"],
		["eof-before-tag-name", "</"],
		
		["eof-in-cdata", "<![CDATA[ "],
		["eof-in-comment", "<!-- comment "],
		["eof-in-doctype", "<!DOCTYPE htm"],
		["eof-in-script-html-comment-like-text", "<script><!-- foo"],
		["eof-in-tag", "<div id="], // Tag should be ignored, apparently?
		
		// Making this one pass slows the parser down a lot.
		//["incorrectly-closed-comment", "<!-- comment --!>"],
		["incorrectly-opened-comment", "<!ELEMENT br EMPTY>text"],
		
		// Not really useful, and not easily possible with the way doctypes are parsed right now.
		//["invalid-character-sequence-after-doctype-name", '<!DOCTYPE html PUBLIC "url" TEST SYSTEM "URL">'],
		
		["invalid-first-character-of-tag-name", "<42></42>"],
		
		["missing-attribute-value", "<div id=>"],
		
		["missing-doctype-name", "<!DOCTYPE>"],
		["missing-doctype-public-identifier", "<!DOCTYPE html PUBLIC>"],
		["missing-doctype-system-identifier", "<!DOCTYPE html SYSTEM>"],
		
		["missing-end-tag-name", "<div></>text</div>"],
		
		["missing-quote-before-doctype-public-identifier", '<!DOCTYPE html PUBLIC -//W3C//DTD HTML 4.01//EN">'],
		["missing-quote-before-doctype-system-identifier", '<!DOCTYPE html SYSTEM http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'],
		
		["missing-semicolon-after-character-reference", "text &not;in."],
		["missing-semicolon-after-character-reference", "text &notin."],
		
		// Not implemented
		//["missing-whitespace-after-doctype-public-keyword", '<!DOCTYPE html PUBLIC"-//W3C//DTD HTML 4.01//EN">'],
		//["missing-whitespace-after-doctype-system-keyword", '<!DOCTYPE html SYSTEM"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'],
		
		["missing-whitespace-before-doctype-name", "<!DOCTYPEhtml>"],
		
		["missing-whitespace-between-attributes", '<div id="foo"class="bar">'],
		
		["missing-whitespace-between-doctype-public-and-system-identifiers", '<!DOCTYPE html PUBLIC "foo""BAR">'],
		
		["nested-comment", "<!-- <!-- nested --> -->"],
		
		["noncharacter-character-reference", "&#xFDD0;"],
		["noncharacter-in-input-stream", "﷐"],
		
		["non-void-html-element-start-tag-with-trailing-solidus", "<div/><span></span><span></span>"],
		
		// Not implemented
		//["null-character-reference", "&#x0000;"],
		//["null-character-reference", "&#0;"],
		//["surrogate-character-reference", ""],
		//["surrogate-in-input-stream", ""],
		
		["unexpected-character-after-doctype-system-identifier", '<!DOCTYPE html PUBLIC "foo" "BAR" text>'],
		
		["unexpected-character-in-attribute-name", "<div foo<div>"],
		["unexpected-character-in-attribute-name", "<div id'bar'>"],
		
		["unexpected-character-in-unquoted-attribute-value", "<div foo=b'ar'>"],
		
		["unexpected-equals-sign-before-attribute-name", '<div foo="bar" ="baz">'],
		
		// Not implemented
		//["unexpected-null-character", "\x00"],
		
		["unexpected-question-mark-instead-of-tag-name", '<?xml-stylesheet type="text/css" href="style.css"?>'],
		
		["unexpected-solidus-in-tag", '<div / id="foo">'],
		["unexpected-solidus-in-tag", '<div attr/id="foo">'],
		
		["unknown-named-character-reference", "&foobar;"],
	] );
} );