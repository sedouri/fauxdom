const {DOM, testEachWithCallback, testEachWithQuery, testEachWithQueryAll, testEachClosest, testEachMatch, testEachSelector, testEachSelectorForFailue, printElementList} = require( "./utils" ),
	{parseSelector} = DOM,
	htmlContent = require( "fs" ).readFileSync( "./tests/dom-api.selectors.test.html", "utf8" );

describe( "DOM API, Selector parsing", () =>
{
	describe( "1. Simple selectors", () =>
	{
		testEachSelector( "Type selector", [
			"a",
			"body",
		] );
		testEachSelectorForFailue( "Invalid type selector", [
			"5",
			"[f]a",
		] );
		testEachSelector( "Universal selector", [
			"*",
			"*#foo",
		] );
		testEachSelectorForFailue( "Invalid universal selector", [
			"a*",
		] );
		testEachSelector( "ID selector", [
			"#\\baba",
			"#\\babar",
			"#\\baba r",
			
			"#foo\\\\bar",
			"#foo\\:bar",
			"#foo\\bar",
			"#foo\\ba r",
			"#foo\\",
		] );
		testEachSelectorForFailue( "Invalid ID selector", [
			"#-bar",
			"#400-bar",
		] );
		testEachSelector( "Class selector", [
			".foo-bar",
			".\\baba r",
			".foo\\\\bar",
		] );
		testEachSelectorForFailue( "Invalid class selector", [
			".400-bar",
		] );
		testEachSelector( "Attribute selector", [
			"[foo]",
			"[foo=bar]",
			"[ foo = bar ]",
			"[foo='bar baz']",
			'[foo="bar baz"]',
			"[foo=bar i]",
			"[foo=bar I ]",
			"[foo=bar s]",
			"[foo=bar S]",
			
			"[foo~=bar]",
			"[foo|=bar]",
			"[foo^=bar]",
			"[foo$=bar]",
			"[foo*=bar]",
			
			"[foo='\\baba\\0\\dada\\ffffff']",
			
			"[CaSe]",
			"[case]",
		] );
		testEachSelectorForFailue( "Invalid attribute selector", [
			"[1foo=bar]",
			"[=bar]",
			"[foo~bar]",
			"[foo&]",
			"[foo=]",
			"[foo=bar",
			"[foo=bar baz]",
			"[foo",
		] );
		testEachSelector( "Pseudo-element selector", [
			"::before",
			"::be\\ fore",
		] );
		testEachSelectorForFailue( "Invalid pseudo-element selector", [
			"::",
			"::5bar",
			"::#foo",
			":::before",
		] );
		testEachSelector( "Pseudo-class selector", [
			":hidden",
			":before",
		] );
		testEachSelectorForFailue( "Invalid pseudo-class selector", [
			":5bar",
			":#foo",
		] );
		testEachSelector( "Functional pseudo-class selector", [
			":lang(en-CA)",
			":dir(ltr)",
			":not(a)",
		] );
		testEachSelectorForFailue( "Invalid functional pseudo-class selector", [
			":is*",
			":is",
			":is()",
			":lang()",
			":lang(en",
			":lang(en:foo",
		] );
	} );
	
	describe( "2. An+B syntax", () =>
	{
		testEachSelector( "Basic", [
			":nth-child(even)",
			":nth-last-child(odd)",
			":nth-of-type(-1n+6)",
			":nth-last-of-type(-4n+10)",
			":nth-col(0n+5)",
			":nth-last-col(1n+0)",
			":nth-child(2n+0)",
			":nth-child(3n-6)",
		] );
		testEachSelector( "Valid white space", [
			":nth-child(3n + 1)",
			":nth-child(+3n - 2)",
			":nth-child(-n+ 6)",
		] );
		testEachSelectorForFailue( "Invalid white space", [
			":nth-child(3 n)",
			":nth-child(+ 2n)",
			":nth-child(+ 2)",
			":nth-child(- 2n - 6)",
		] );
		testEachSelector( "Missing parts", [
			":nth-child(-n-1)",
			":nth-child(+n+1)",
			":nth-child(+n - 1)",
			":nth-child(n+0)",
			":nth-child(n)",
			":nth-child(2n)",
			":nth-child(+6)",
			":nth-child(10)",
		] );
		testEachSelectorForFailue( "Invalid parts", [
			":nth-child(3n + -6)",
		] );
	} );
	
	describe( "3. Combinators", () =>
	{
		testEachSelector( "Descendant", [
			"a b",
		] );
		testEachSelector( "Next-sibling", [
			"a+b",
		] );
		testEachSelector( "Child", [
			"a>b",
		] );
		testEachSelector( "Subsequent-sibling", [
			"a~b",
		] );
		testEachSelector( "Start of a relative selector", [
			"a:has(~b)",
		] );
		testEachSelectorForFailue( "Invalid", [
			"a + ~ b",
			"a +~ b",
			"a +",
			"+ a",
		] );
	} );
	
	describe( "4. Selector list (multiple compound selectors)", () =>
	{
		testEachSelector( "Basic", [
			"a, b",
			", b",
			"a , b",
			"a,b",
		] );
		testEachSelectorForFailue( "Invalid", [
			"a+, b",
		] );
	} );
} );

describe( "DOM API, Selector running", () =>
{
	const document = new DOM( htmlContent, {decodeEntities: true, trimWhitespace: true} );
	
	describe( "querySelectorAll", () =>
	{
		// https://drafts.csswg.org/selectors-4/#elemental-selectors
		describe( "1. Elemental selectors", () =>
		{
			testEachWithQueryAll( document, "1.0 Type (tag name) selector", [
				"html",
				"div",
				"p",
			] );
			testEachWithQueryAll( document, "2.0 Universal selector", [
				"*",
				"* html",
				"* div",
				"p *",
			] );
		} );
		
		// https://drafts.csswg.org/selectors-4/#attribute-selectors
		describe( "2. Attribute selectors", () =>
		{
			testEachWithQueryAll( document, "1.0 Attribute presence and value selectors", [
				"[name]",
				"[name=name]",
				"[foo~=i]",
				"a[hreflang|=en]",
			] );
			testEachWithQueryAll( document, "1.1 Attribute presence and value selectors", [
				"[name='']",
				"[foo~='']",
				"a[hreflang|='']",
			] );
			testEachWithQueryAll( document, "2.0 Substring matching attribute selectors", [
				"[name^=\\\"]",
				"[id$=bar]",
				"[name*=am]",
			] );
			testEachWithQueryAll( document, "2.1 Substring matching attribute selectors", [
				"[name^='']",
				"[id$='']",
				"[name*='']",
			] );
			testEachWithQueryAll( document, "3.0 Case-sensitivity", [
				"[foo=j i]",
				"[foo=j\\ i]",
				"[foo^=j i]",
				"[foo~=j i]",
			] );
			testEachWithQueryAll( document, "4.0 Class selectors", [
				".i",
				".h",
				".a.b",
				".i .i",
			] );
			testEachWithQueryAll( document, "5.0 ID selectors", [
				"#foo\\:bar",
				"#foo\\:bar#foo\\:bar",
			] );
		} );
		
		// https://drafts.csswg.org/selectors-4/#logical-combination
		describe( "3. Logical combinations", () =>
		{
			testEachWithQueryAll( document, "1.0 Selector lists", [
				"div, span, br",
				":disabled, .i, p, [foo]",
			] );
			testEachWithQueryAll( document, "2.0 Matches-any pseudo-class ':is()'", [
				".i:is( p, b )",
				".i:where( p, b )", // Alias of :is()
			] );
			testEachWithQueryAll( document, "3.0 Negation (matches-none) pseudo-class ':not()'", [
				".i:not( p, b )",
			] );
			testEachWithQueryAll( document, "4.0 Relational pseudo-class ':has()'", [
				"div:has( [foo] )",
				"div:has( ~ [foo] )",
				"div:has( ~ [foo], p )",
				"div:has( + [foo] )",
			] );
			testEachWithQueryAll( document, "5.0 Unimplemented functional pseudo-class", [
				":dir( ltr )",
			] );
		} );
		
		// https://drafts.csswg.org/selectors-4/#input-pseudos
		describe( "4. Input pseudo-classes", () =>
		{
			testEachWithQueryAll( document, "1.0 Input control states", [
				":enabled",
				":disabled",
			] );
			testEachWithQueryAll( document, "2.0 Input value states", [
				":checked",
			] );
			testEachWithQueryAll( document, "3.0 Input value-checking", [
				":required",
				":optional",
			] );
		} );
		
		// https://drafts.csswg.org/selectors-4/#structural-pseudos
		describe( "5. Tree-structural pseudo-classes", () =>
		{
			testEachWithQueryAll( document, "1.0 Basic", [
				":root",
				"html:root",
				"head:root",
				
				":empty",
				"p:empty",
				"div:empty",
			] );
			testEachWithQueryAll( document, "1.1 Unknown", [
				":pseudo",
				"html:pseudo",
				"div:pseudo",
			] );
			testEachWithQueryAll( document, "2.0 Child-indexed pseudo-classes", [
				":first-child",
				"meta:first-child",
				"p:first-child",
				
				":last-child",
				"meta:last-child",
				"p:last-child",
				
				":only-child",
				"meta:only-child",
				"p:only-child",
				"br:only-child",
			] );
			testEachWithQueryAll( document, "3.0 Typed child-indexed pseudo-classes", [
				":first-of-type",
				"meta:first-of-type",
				"p:first-of-type",
				
				":last-of-type",
				"meta:last-of-type",
				"p:last-of-type",
				
				":only-of-type",
				"meta:only-of-type",
				"p:only-of-type",
				"br:only-of-type",
			] );
		} );
		
		// https://drafts.csswg.org/selectors-4/#pseudo-elements
		describe( "6. Pseudo-elements", () =>
		{
			testEachWithQueryAll( document, "1.0 Basic", [
				"::before",
				"::after",
				"::first-line",
				"::first-letter",
				"::custom",
			] );
		} );
		
		// https://drafts.csswg.org/selectors-4/#combinators
		describe( "7. Combinators", () =>
		{
			testEachWithQueryAll( document, "1.0 Descendant", [
				"form :disabled",
			] );
			testEachWithQueryAll( document, "2.0 Child", [
				"form > :disabled",
				"form > option",
			] );
			testEachWithQueryAll( document, "3.0 Next-sibling", [
				"input + input",
			] );
			testEachWithQueryAll( document, "4.0 Subsequent-sibling", [
				"input ~ input",
			] );
		} );
	} );
	
	describe( "querySelector", () =>
	{
		testEachWithQuery( document, "Basic", [
			"p",
			"form option:last-of-type",
			"div *",
			"#nothing",
		] );
		testEachWithQuery( document, "Attribute selectors", [
			"[CaSe]",
			"[case]",
		] );
		testEachWithQuery( new DOM( htmlContent, {lowerAttributeCase: true} ), "Attribute selectors with lower case attribute names", [
			"[CaSe]",
			"[case]",
		] );
	} );
	
	describe( "matches", () =>
	{
		testEachMatch( "Basic", [
			[".outer .inner", document.querySelector( "div.select > div.inner" ), true],
		] );
	} );
	
	describe( "closest", () =>
	{
		const inner = document.querySelector( "section div.inner" );
		testEachClosest( "Basic", [
			[".select", inner],
			["div div", inner],
			["section > div", inner],
			[":not( div )", inner],
			[":scope", inner],
			["p", inner],
		] );
	} );
	
	describe( "Scoping", () =>
	{
		test.each( [
			["Without :scope", () =>
			{
				const select = document.querySelector( "div.select" );
				return select.querySelectorAll( ".outer .inner" );
			}],
			["With :scope", () =>
			{
				const select = document.querySelector( "div.select" );
				return select.querySelectorAll( ":scope .outer .inner" );
			}]
		] )( "%s", ( name, callback ) =>
			expect( printElementList( callback() ) ).toMatchSnapshot() );
	} );
} );