# FauxDOM

![Build Status](https://github.com/sedouri/fauxdom/workflows/build/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/sedouri/fauxdom/badge.svg?branch=master)](https://coveralls.io/github/sedouri/fauxdom?branch=master)

A fast and lightweight JavaScript library for parsing, modifying, and outputting HTML using a (mostly) standard DOM API, either on the server in Node.js or in any reasonably modern browser.

## Description

FauxDOM is meant to parse HTML the same way browsers do, while also being as fast as possible. Some compromises were made for performance reasons that make FauxDOM treat some less-than-valid HTML different from a standards-compliant browser. With this in mind, any major structural differences between what FauxDOM produces and what a browser produces *should* be safe to view as a problem with the HTML document itself. However, if you come across a scenario where you believe FauxDOM is incorrect, and this same issue hasn't been reported yet, feel free to [open a new issue](../../issues/new).

Having a *mostly* standards-compliant DOM API means that some parts of FauxDOM's implementation of the standards fully work, while others either don't or are different in some way. The [documentation](docs/DOM.md) will list properties and methods as either **standard**, **semi-standard** (when their behaviour is different from the standard), or **non-standard** to give you a more clear idea of how FauxDOM differs from the standard DOM API.

### What Works

- **Standards-based API**

  FauxDOM implements a subset of the standard DOM API as defined by the [WHATWG](https://dom.spec.whatwg.org/), and documented by [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model).

  The full list of supported API methods and properties can be found in the [documentation](docs/DOM.md).

- **Selector engine**

  The main portion of the [Selectors Level 4 API](https://drafts.csswg.org/selectors-4/) that can be used to identify elements has been implemented and is used by [`Node.closest()`](docs/Node.md#methods-closest), [`Node.matches()`](docs/Node.md#methods-matches), [`Node.querySelector()`](docs/Node.md#methods-query-selector), and [`Node.querySelectorAll()`](docs/Node.md#methods-query-selector-all).
  
  The full list of supported selectors can be found in the [selectors documentation](docs/Selectors.md).

### What Doesn't

- **Namespaces**

  HTML namespaces in general are not supported by FauxDOM. Any standard DOM API methods that end in "NS" are not implemented, and any other methods that should work with namespaces according to the spec will simply ignore any requests to work on namespaces.

  Namespaces in selectors (for [`Node.querySelector()`](docs/Node.md#methods-query-selector), etc.), in addition to not being supported, will actually cause a syntax error to be thrown.

- **Attribute nodes**

  While FauxDOM fully supports attributes on elements, attribute values are only ever worked with as strings rather than attribute node objects. As such, any standard DOM API methods that work with attribute nodes (eg. [`createAttribute()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createAttribute), [`getAttributeNode()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNode), [`setAttributeNode()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttributeNode), etc.) are not implemented.

- **Element adoption**

  For performance reasons, FauxDOM doesn't implement what the WHATWG's HTML 5 spec calls the [adoption agency algorithm](https://html.spec.whatwg.org/multipage/parsing.html#adoption-agency-algorithm), instead opting for a significantly more simplistic method of determining which elements can be the children of which other elements when parsing HTML.

### What's Different

- **`Array`-like objects**

  For many standard DOM API methods that would normally work with a collection of values using an [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)-like object (such as [`NamedNodeMap`](https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap) and [`NodeList`](https://developer.mozilla.org/en-US/docs/Web/API/NodeList)), FauxDOM instead simply uses an `Array` to store the values. The main exception to this is [`DOMTokenList`](docs/DOMTokenList.md), accessible from [`Node.classList`](docs/Node.md#properties-class-list), which is a mostly complete implementation of the [standard DOM API class](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList) of the same name.

## Installing

### Server-side (Node.js)

```sh
npm install fauxdom
```

### Client-side (browsers)

For client-side use, FauxDOM comes in two distinct flavours:

1. **`fauxdom.zip`** &mdash; *Old-school everything-lives-in-the-global-scope style*

   Including this in your page will result in a single class called `DOM` being globally defined.

2. **`fauxdom.module.zip`** &mdash; *Way-of-the-future ES module style*

   The module exports a single class named `DOM`.

Download the [latest release](../../releases/latest) of the style you want.

<a name="entities-variants"></a>`entities.zip` and `entities.module.zip` are also available to download if you want to be able to encode and decode the entire set of HTML entities as defined by the HTML 5 standard. Please see [the note about the standard set of entities](docs/DOM.md#standard-entities-note) if you intend to use the full set.

## Using

In Node.js, as is usual, you'll need to `require()` FauxDOM to use it:

```javascript
const DOM = require( "fauxdom" );
```

For use on a webpage, include `fauxdom.js` before code that uses FauxDOM:

```html
<script src="fauxdom.js" type="text/javascript"></script>
<script>var doc = new DOM();</script>
```

FauxDOM can also be used as an ES module by importing the module's single export `DOM`:

```javascript
import DOM from "/fauxdom.js";
```

Once the `DOM` class is accessible by your code, you're ready to start creating and working with documents. The [`DOM` reference documentation](docs/DOM.md) is an excellent place to start reading about how to use FauxDOM.

## Examples

As a simple example of making an empty document be *slightly* more meaningful, the following code:

```javascript
const document = new DOM( "<!DOCTYPE html><html><head></head><body></body></html>" );

document.title = "Page";

const header = document.createElement( "h1" );
header.textContent = "Hello, world.";
document.body.appendChild( header );

console.log( document.innerHTML );
```

will output (with spaces and line breaks added for readability):

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Page</title>
    </head>
    <body>
        <h1>Hello, world.</h1>
    </body>
</html>
```

A more advanced use-case could be to create a Node.js server that implements a JavaScript-based system similar to PHP:

```javascript
const html = "<?js '<div>'+ (21 * 2) +'</div>'?>";
const document = new DOM( html, {allowProcessingInstructions: true} );

document.forEach( node =>
{
    if ( node.target === "js" )
        node.outerHTML = eval( node.textContent );
}, DOM.Node.PROCESSING_INSTRUCTION_NODE );

console.log( document.innerHTML );
```

Even though the above code isn't anywhere near production quality, with absolutely no error handling or considerations for security, it is the minimum amount of work needed to allow HTML code like the above `<?js '<div>'+ (21 * 2) +'</div>'?>` to be output as:

```html
<div>42</div>
```

## Requirements

FauxDOM requires at least Node.js 6 (or compatible) on the server side, and Chrome 5, Firefox 4, Internet Explorer 9, Opera 11.6, or Safari 5 (or compatible) on the client side. These browser requirements are driven by the need for [`Object.defineProperties`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties), for which no valid polyfill exists (getters and setters are needed, but not supported in versions of IE less than 9).

FauxDOM also requires, and includes, basic polyfills for the following JavaScript APIs. The first version of each browser that supports each API is also included.

|                                                              | Chrome | Edge | Firefox |     IE     | Opera | Safari | Node.js |
| :----------------------------------------------------------- | :----: | :--: | :-----: | :--------: | :---: | :----: | :-----: |
| [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility) |   38   |  12  |   36    | ***none*** |  25   |   9    |  *all*  |
| [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Browser_compatibility) |   45   |  12  |   34    | ***none*** |  32   |   9    |    4    |
| [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#Browser_compatibility) |   6    |  12  |    4    |     9      |  12   |  5.1   |  *all*  |
| [`String.fromCodePoint`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint#Browser_compatibility) |   41   |  12  |   29    | ***none*** |  28   |   10   |    4    |
| [`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Browser_compatibility) |   7    |  12  |    4    |     9      | 11.6  |  5.1   |  *all*  |

If your project already includes a polyfill for any of the above, include your polyfill before FauxDOM to keep FauxDOM's simplistic polyfills from being used.

## License

[MIT](LICENSE)