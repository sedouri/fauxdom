/* @START_BROWSER_ONLY */
const hasOwnProperty = Object.prototype.hasOwnProperty,
	slice = Array.prototype.slice;

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
			var source = arguments[i];
			if ( source && typeof source === "object" )
				for ( let k in source ) if ( hasOwnProperty.call( source, k ) )
					target[k] = source[k];
		}
		return target;
	}

if ( !Object.freeze )
	Object.freeze = function( obj )
	{
		for ( let k in obj )
		{
			const prop = Object.getOwnPropertyDescriptor( obj, k );
			if ( prop && "value" in prop )
			{
				prop.writable = prop.configurable = false;
				Object.defineProperty( obj, k, prop );
			}
		}
	}

if ( !String.fromCodePoint )
	String.fromCodePoint = function()
	{
		var codePoint, result = [];
		
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

if ( !Function.prototype.bind )
	Function.prototype.bind = function( thisArg )
	{
		var boundFn = this,
			args = slice.call( arguments, 1 );
		
		if ( typeof boundFn !== "function" )
			throw new TypeError( "Bind must be called on a function" );
		
		return function()
		{
			return boundFn.apply( thisArg, args.concat( slice.call( arguments ) ) );
		}
	}
/* @END_BROWSER_ONLY */