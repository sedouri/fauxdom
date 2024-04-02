import {spacesRE} from "./utils.js"

const ELEMENT = Symbol( "element" );
const LENGTH = Symbol( "length" );

const validClassTokenRE = /^\S+$/;

const indexOf = Array.prototype.indexOf;
const join = Array.prototype.join;
const splice = Array.prototype.splice;

export function createTokenList( elem )
{
	const list = Object.create( DOMTokenList.prototype );
	
	list[LENGTH] = 0;
	list[ELEMENT] = elem;
	const className = elem.className;
	if ( className ) list.value = className;
	
	return list;
}

export default class DOMTokenList
{
	constructor()
	{
		throw new Error( "Cannot directly instantiate DOMTokenList." );
	}
	
	get length() {return this[LENGTH]}
	set length( val ) {}
	
	get value()
	{
		return join.call( this, " " );
	}
	set value( val )
	{
		if ( this[LENGTH] > 0 )
			for ( const key in this ) if ( Object.hasOwn( this, key ) && isFinite( key ) )
				delete this[key];
		this[LENGTH] = 0;
		
		if ( typeof val === "string" )
			this.add.apply( this, val.split( spacesRE ) );
		else delete this[ELEMENT].attributes.class;
	}
	
	add()
	{
		for ( let i = 0; i < arguments.length; i++ )
			if ( indexOf.call( this, arguments[i] ) === -1 && this.supports( arguments[i] ) )
				this[this[LENGTH]++] = arguments[i];
		this[ELEMENT].attributes.class = this.value;
	}
	
	remove()
	{
		for ( let i = 0, idx; i < arguments.length; i++ )
		{
			idx = indexOf.call( this, arguments[i] );
			if ( idx !== -1 )
			{
				splice.call( this, idx, 1 );
				this[LENGTH]--;
			}
		}
		this[ELEMENT].attributes.class = this.value;
	}
	
	item( v )
	{
		if ( typeof v === "number" && v >= 0 && v < this[LENGTH] )
			return this[v];
	}
	
	toggle( token, force )
	{
		let exists = false;
		if ( this.supports( token ) )
		{
			const idx = indexOf.call( this, token );
			if ( idx !== -1 && force !== true )
			{
				splice.call( this, idx, 1 );
				this[LENGTH]--;
			}
			else if ( force !== false )
			{
				exists = true;
				if ( idx === -1 )
					this[this[LENGTH]++] = token;
			}
			this[ELEMENT].attributes.class = this.value;
		}
		return exists;
	}
	
	contains( token )
	{
		return (indexOf.call( this, token ) !== -1);
	}
	
	replace( token, newToken )
	{
		const idx = indexOf.call( this, token );
		if ( idx >= 0 && this.supports( newToken ) )
		{
			if ( indexOf.call( this, newToken ) === -1 )
				this[idx] = newToken;
			else
			{
				splice.call( this, idx, 1 );
				this[LENGTH]--;
			}
			this[ELEMENT].attributes.class = this.value;
			return true;
		}
		return false;
	}
	
	supports( token )
	{
		if ( token && typeof token === "string" )
			return token.match( validClassTokenRE );
		return false;
	}
}