/* @START_BROWSER_ONLY */
const hasOwnProperty = Object.prototype.hasOwnProperty;
const slice = Array.prototype.slice;

if ( !window.Symbol )
	window.Symbol = function( name )
	{
		return "@@"+ name +"_"+ Math.floor( Math.random() * 0xFFFFFFFF ).toString( 16 );
	}

if ( !Object.assign )
	Object.assign = function( target )
	{
		if ( target == null ) return target;
		target = Object( target );
		for ( let i = 1; i < arguments.length; i++ )
		{
			const source = arguments[i];
			if ( source && typeof source === "object" )
				for ( const key in source ) if ( hasOwnProperty.call( source, key ) )
					target[key] = source[key];
		}
		return target;
	}

if ( !Object.freeze )
	Object.freeze = function( obj )
	{
		for ( const key in obj )
		{
			const prop = Object.getOwnPropertyDescriptor( obj, key );
			if ( prop && "value" in prop )
			{
				prop.writable = prop.configurable = false;
				Object.defineProperty( obj, key, prop );
			}
		}
	}

if ( !Object.hasOwn )
	Object.hasOwn = function( obj, key )
	{
		if ( obj == null ) return false;
		return hasOwnProperty.call( Object( obj ), key );
	}

if ( !String.fromCodePoint )
	String.fromCodePoint = function()
	{
		let codePoint;
		const result = [];
		
		for ( let i = 0; i < arguments.length; i++ )
		{
			codePoint = arguments[i] | 0;
			
			if ( (codePoint | 0) !== codePoint ||
					codePoint < 0 ||
					codePoint > 0x10FFFF )
				result.push( 0xFFFD ); // replacement character
				
			else if ( codePoint < 0xFFFF )
				result.push( codePoint );
				
			else
			{
				codePoint -= 0x10000; // offset
				result.push(
					(codePoint >> 10) | 0xD800, // lead surrogate
					(codePoint & 0x3FF) | 0xDC00 // trail surrogate
				);
			}
		}
		
		return String.fromCharCode.apply( null, result );
	}

if ( !String.prototype.trimStart )
{
	if ( String.prototype.trimLeft )
	{
		String.prototype.trimStart = String.prototype.trimLeft;
		String.prototype.trimEnd = String.prototype.trimRight;
	}
	else
	{
		const trimStartRE = /^[\s\uFEFF\xA0]+/g;
		const trimEndRE = /[\s\uFEFF\xA0]+$/g;
		
		String.prototype.trimStart = function()
		{
			return this.replace( trimStartRE, "" );
		}
		
		String.prototype.trimEnd = function()
		{
			return this.replace( trimEndRE, "" );
		}
	}
}

if ( !Array.prototype.find )
	Array.prototype.find = function( callback, thisArg )
	{
		for ( let i = 0; i < this.length; i++ )
			if ( callback.call( thisArg, this[i], i, this ) )
				return this[i];
	}

if ( !Function.prototype.bind )
	Function.prototype.bind = function( thisArg )
	{
		const args = slice.call( arguments, 1 );
		
		if ( typeof this !== "function" )
			throw new TypeError( "Bind must be called on a function" );
		
		return () => this.apply( thisArg, args.concat( slice.call( arguments ) ) );
	}
/* @END_BROWSER_ONLY */