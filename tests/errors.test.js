const {DOM} = require( "./utils" );

describe( "Basic Sanity Checking", () =>
{
	const document = new DOM( "<!DOCTYPE html><html><head></head><body><div></div></body></html>" );
	
	test( "Bad parameters", () =>
	{
		expect( document.body.getElementById( "" ) ).toBeNull();
		expect( document.body.getElementById() ).toBeNull();
		expect( document.body.querySelectorAll( "" ) ).toEqual( [] );
		expect( document.body.querySelectorAll() ).toEqual( [] );
		expect( document.body.querySelector( "" ) ).toBeNull();
		expect( document.body.querySelector() ).toBeNull();
		expect( document.body.closest( "" ) ).toBeNull();
		expect( document.body.closest() ).toBeNull();
		expect( document.body.matches( "" ) ).toBe( false );
		expect( document.body.matches() ).toBe( false );
	} );
} );