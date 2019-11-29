const reCache = {},
	whitespaces = {},
	isWhiteSpace = Object.prototype.hasOwnProperty.bind( whitespaces ),
	EOF = null;

export {whitespaces, EOF};

export class Lexer
{
	constructor( str )
	{
		this.index = 0;
		this.str = str;
		this.scanChar = this.str[this.index];
		
		if ( !isWhiteSpace( "\x20" ) )
		{
			// Unicode C0 & C1 control characters are treated as whitespace, along with the ASCII space character.
			for ( let i = 0; i <= 0x20; i++ )
				whitespaces[String.fromCharCode( i )] = null;
			for ( let i = 0x80; i <= 0x9f; i++ )
				whitespaces[String.fromCharCode( i )] = null;
		}
	}
	
	isWhiteSpace( theChar )
	{
		return (theChar !== EOF && isWhiteSpace( theChar ));
	}
	
	goToString( toChar, caseSensitive )
	{
		if ( caseSensitive !== false )
			this.index = this.str.indexOf( toChar, this.index );
		else
		{
			if ( !reCache[toChar] )
				reCache[toChar] = new RegExp( toChar, "ig" );
			
			reCache[toChar].lastIndex = this.index;
			
			const match = reCache[toChar].exec( this.str );
			if ( match ) this.index = match.index;
			else this.index = -1;
		}
		
		if ( this.index > -1 )
			this.scanChar = this.str[this.index];
		else
		{
			this.index = this.str.length;
			this.scanChar = EOF;
		}
	}
	
	advance( amount )
	{
		this.index += amount;
		if ( this.index > this.str.length )
		{
			this.index = this.str.length;
			return (this.scanChar = EOF);
		}
		return (this.scanChar = this.str[this.index]);
	}
	
	match( str, caseSensitive )
	{
		var chunk = this.str.substr( this.index, str.length );
		if ( caseSensitive === false )
		{
			str = str.toLowerCase();
			chunk = chunk.toLowerCase();
		}
		if ( chunk === str )
		{
			this.index += str.length-1;
			this.getNextChar();
			return true;
		}
		return false;
	}
	
	peek()
	{
		return this.str[this.index + 1];
	}
	
	getChar()
	{
		return this.scanChar;
	}
	
	getNextChar()
	{
		if ( this.index + 1 < this.str.length )
			return (this.scanChar = this.str[++this.index]);
		else
		{
			this.index = this.str.length;
			return (this.scanChar = EOF);
		}
	}
	
	getNextAfterWhiteSpace()
	{
		var theChar;
		do theChar = this.getNextChar();
		while ( theChar !== EOF && isWhiteSpace( theChar ) )
		return theChar;
	}
	
	skipWhiteSpace()
	{
		var theChar = this.scanChar;
		
		while ( theChar !== EOF && isWhiteSpace( theChar ) )
			theChar = this.getNextChar();
		
		return this.scanChar;
	}
}