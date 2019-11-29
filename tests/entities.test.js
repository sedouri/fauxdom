const {DOM, testEachWithAllOutput, testEachWithEntities, testEachWithStandardEntities, printAll} = require( "./utils" );

describe( "Entities", () =>
{
	const invalidEntityProto = {foo: "f"},
		invalidEntities = Object.create( invalidEntityProto, {bar: {value: "", enumerable: true}, baz: {value: "b", enumerable: true}} ),
		nonEnumEntities = Object.create( null, {foo: {value: "f", enumerable: false}} );
	
	describe( "Encode all entities", () =>
	{
		let document = new DOM( null, {decodeEntities: true, encodeEntities: true} );
		testEachWithEntities( document, [
			["Custom entities", {test: "42"}, "&test;"],
			["No set entities", undefined, "&"],
			["Invalid entities", invalidEntities, "fb"],
			["Non-enumerable entities", nonEnumEntities, "f"],
		] );
		
		test( "Empty EntityEncoder from different document", () =>
		{
			const otherDoc = new DOM( null, {entities: {}} );
			document.entityEncoder.entities = otherDoc.entityEncoder;
			expect( JSON.stringify( document.entityEncoder ) ).toMatchSnapshot();
		} );
		
		test( "Custom default entities", () =>
		{
			DOM.EntityEncoder.defaultEntities = {"customAmp": "&"};
			const otherDoc = new DOM( "& &customAmp;", {decodeEntities: true, encodeEntities: true} );
			expect( printAll( otherDoc ) ).toMatchSnapshot();
		} );
		
		test( "Invalid custom default entities", () =>
		{
			DOM.EntityEncoder.defaultEntities = null;
			const otherDoc = new DOM( "& &customAmp;", {decodeEntities: true, encodeEntities: true} );
			expect( printAll( otherDoc ) ).toMatchSnapshot();
		} );
		
		test( "RegExp syntax in entity value", () =>
		{
			document.entityEncoder.entities = {RegExp: "[a-z]", Partial: "a-z"};
			document.innerHTML = "[a-z] &RegExp; a-z &Partial;";
			expect( printAll( document ) ).toMatchSnapshot();
		} );
		
		test( "RegExp 'what' value in encode()", () =>
		{
			document.entityEncoder.entities = {jay: "j"};
			expect( document.entityEncoder.encode( "hijk", /[hj]/ ) ).toMatchSnapshot();
			expect( document.entityEncoder.encode( "hijk", /[hj]/g ) ).toMatchSnapshot();
		} );
		
		testEachWithStandardEntities( document, [
			["Acute A", "\u00C1"],
			["Acute a", "\u00E1"],
			["Acute A entity", "&Aacute;"],
			["Acute a entity", "&aacute;"],
			["Mathematical fraktur A entity", "&Afr;"],
			["Mathematical fraktur a entity", "&afr;"],
		] );
	} );
	
	describe( "Only basic entities", () =>
	{
		const document = new DOM( null, {decodeEntities: true, encodeEntities: true} );
		DOM.EntityEncoder.defaultEntities = "";
		document.entityEncoder.entities = "default";
		testEachWithAllOutput( document, [
			["All basics", "&amp;&apos;&copy;&gt;&lt;&nbsp;&quot;&afr;"],
			
			["Inside SCRIPT", "<script>&amp; <></script>&amp;"],
			["Inside STYLE", "<style>&amp; <></style>&amp;"],
		] );
	} );
	
	describe( "No processing", () =>
	{
		testEachWithStandardEntities( new DOM( null, {decodeEntities: false} ), [
			["Ampersand", "&amp;"],
			["Ampersand", "&"],
			
			["Greater-than", "&gt;"],
			["Greater-than", ">"],
			
			["Less-than", "&lt;"],
			["Less-than", "<"],
		] );
	} );
	
	describe( "Only encode specific entities", () =>
	{
		testEachWithStandardEntities( new DOM( null, {decodeEntities: true, encodeEntities: /[\n\u00E1]/g} ), [
			["Line breaks", "\r\n"],
			["Acute a", "&Aacute;&aacute;"],
		] );
		testEachWithStandardEntities( new DOM( null, {decodeEntities: true, encodeEntities: /[\n\u00E1]/} ), [
			["Non-global RegExp", "\n&aacute;\n"],
		] );
	} );
} );