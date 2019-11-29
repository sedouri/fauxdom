# DOM

The `DOM` class, when instantiated, parses the HTML that is passed as the first argument, with the newly constructed instance acting as the document's root node. The `DOM` class extends [`Node`](Node.md), providing document instances with the full suite of `Node` methods and properties with a [couple](#properties-inner-html) [overrides](#properties-outer-html). The [properties](#properties) and [methods](#methods) described below are only those that are unique to the `DOM` class or have been overridden from the implementation of the same name in the `Node` class.

## Table of Contents

- [Construction](#construction)
  - [options](#options)
    - [allowCustomRootElement](#option-allow-custom-root-element)
    - [allowSelfClosingSyntax](#option-allow-self-closing-syntax)
    - [allowCDATA](#option-allow-cdata)
    - [allowProcessingInstructions](#option-allow-processing-instructions)
    - [decodeEntities](#option-decode-entities)
    - [encodeEntities](#option-encode-entities)
    - [entities](#option-entities)
    - [collapseWhitespace](#option-collapse-whitespace)
    - [trimWhitespace](#option-trim-whitespace)
    - [lowerAttributeCase](#option-lower-attribute-case)
- [Properties](#properties)
  - [Non-standard](#non-standard)
    - [entityEncoder](#properties-entity-encoder)
    - [innerHTML](#properties-inner-html)
    - [outerHTML](#properties-outer-html)
  - [Semi-standard](#semi-standard)
    - [doctype](#properties-doctype)
    - [documentElement](#properties-document-element)
  - [Standard](#standard)
    - [body](#properties-body)
    - [head](#properties-head)
    - [title](#properties-title)
- [Methods](#methods)
  - [createCDATASection](#methods-create-cdata-section)
  - [createComment](#methods-create-comment)
  - [createDocumentType](#methods-create-document-type)
  - [createElement](#methods-create-element)
  - [createProcessingInstruction](#methods-create-processing-instruction)
  - [createTextNode](#methods-create-text-node)
  - [getElementsByName](#methods-get-elements-by-name)
  - [Node.js Only (Non-standard)](#nodejs-only-non-standard)
    - [importStandardEntities](#methods-import-standard-entities)
    - [importStandardEntities (static)](#methods-static-import-standard-entities)

## Construction

```javascript
new DOM( htmlContent[, options] )
```

**Parameters**

- **`htmlContent`** String

  The HTML to parse into an editable DOM object.

- <a name="options"></a>**`options`** Object *(optional)*

  An object with some or all of the following properties:

  - <a name="option-allow-custom-root-element"></a>**`allowCustomRootElement`** Boolean *(default:* `false`*)*

    Whether to allow the document type `Node` to specify the tag name of the root `Node`. In HTML documents, the root `Node` is always an `<html>` element, but in XML documents, the `<!DOCTYPE>` node's `name` is used to specify which element is the root.

    For example, `<!DOCTYPE doc>` indicates the root node to be the `<doc>` element. However, for that to work, the `<doc>` element has to be the top most `Node` in the document's hierarchy.

  - <a name="option-allow-self-closing-syntax"></a>**`allowSelfClosingSyntax`** Boolean *(default:* `false`*)*

    Whether to allow tags to be self-closing (ie. have a forward-slash "/" at the very end of the open tag instead of having a closing tag, like `<div />`). Useful for parsing XML.

  - <a name="option-allow-cdata"></a>**`allowCDATA`** Boolean *(default:* `false`*)*

    Whether to parse XML CDATA tags (like `<![CDATA[ data ]]>`). When this is `false`, any CDATA tags that are encountered will be parsed as comments.

  - <a name="option-allow-processing-instructions"></a>**`allowProcessingInstructions`** Boolean *(default:* `false`*)*

    Whether to parse processing instructions (like `<?instruction data?>`). When this is `false`, any processing instructions that are encountered will be parsed as comments.

  - <a name="option-decode-entities"></a>**`decodeEntities`** Boolean *(default:* `false`*)*

    Whether to decode HTML entities (eg. turning `&amp;` into `&`) while parsing HTML.

  - <a name="option-encode-entities"></a>**`encodeEntities`** Boolean **or** RegExp *(default:* `false`*)*
  
    If specified as a `Boolean`, whether to encode HTML entities (eg. turning `&` into `&amp;`) when serializing nodes as text.
  
    If specified as a `RegExp`, the [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) will be used to determine which characters (or sequences of characters) should be encoded as entities. The entities have to exist in this document's [`entityEncoder`](#properties-entity-encoder), or the match made by the `RegExp` will be ignored.
  
  - <a name="option-entities"></a>**`entities`** [Entities](EntityEncoder.md#entities) *(default:* `undefined`*)*
  
    If specified, this will be the set of entities used during entity encoding and decoding. Leaving this `undefined`, or setting it to a [falsy value](https://developer.mozilla.org/en-US/docs/Glossary/Falsy), results in the set of default entities being used instead. The default set of entities can be changed by assigning a [set of entities](EntityEncoder.md#entities) to [`EntityEncoder.defaultEntities`](EntityEncoder.md#properties-default-entities).
  
  - <a name="option-collapse-whitespace"></a>**`collapseWhitespace`** Boolean *(default:* `false`*)*
  
    Whether to collapse multiple consecutive whitespace characters in text nodes into a single space character, mimicking how browsers render consecutive whitespace characters. This option is ignored if `trimWhitespace` is `true`.
  
  - <a name="option-trim-whitespace"></a>**`trimWhitespace`** Boolean *(default:* `false`*)*
  
    Whether to remove whitespace characters from both ends of text nodes, which is useful for minifying HTML documents. When this option is `true`, the `collapseWhitespace` option is ignored.
  
  - <a name="option-lower-attribute-case"></a>**`lowerAttributeCase`** Boolean *(default:* `false`*)*
  
    Whether to convert attribute names on tags to lower case. When this is `false`, attribute selectors will be case sensitive (ie. the selector `[CaSe]` *will* match the element `<div CaSe></div>`, but the selector `[case]` *will not*). This is `false` by default for performance reasons, but should be `true` if you want standards-compliant behaviour.

## Properties

### Non-standard

- <a name="properties-entity-encoder"></a>**`entityEncoder`** [EntityEncoder](EntityEncoder.md) *(read-only)*

  The `EntityEncoder` instance used by this `DOM` instance for entity encoding and decoding. Changing the [`entities`](EntityEncoder.md#properties-entities) of this `EntityEncoder` will only affect this document.

- <a name="properties-inner-html"></a>**`innerHTML`** String *(override)*

  Gets or sets the HTML markup of the entire document, including any `<!DOCTYPE>` node that may be present. When setting this with markup that either doesn't specify a `<!DOCTYPE>` or doesn't have an `<html>` element as the [root node](#properties-document-element), the document's `nodeType` property will be `DOCUMENT_FRAGMENT_NODE` instead of `DOCUMENT_NODE`. When specifying a `<!DOCTYPE>`, the node that is named in the document type tag will be expected as the document's root instead of `<html>`.

- <a name="properties-outer-html"></a>**`outerHTML`** Null *(override)*

  This simply overrides [`Node.outerHTML`](Node.md#properties-outer-html), making it do nothing on `DOM` instances.

### Semi-standard

- <a name="properties-doctype"></a>**`doctype`** [Node](Node.md), Object, **or** Null — [[standard](https://dom.spec.whatwg.org/#dom-document-doctype)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/doctype)]

  Gets the document type node associated with the document if one is present, or `null` otherwise. Unlike the standard, you may set this property using a document type node (such as from [`DOM.createDocumentType()`](#methods-create-document-type)), or an `Object` with `name` *(required)*, `publicId` *(optional)*, and `systemId` *(optional)* properties as strings. You may also set this to `null` to remove an existing document type from a document.

  When set to an `Object`, if the object either doesn't have a `name` property, or the property's value isn't a string, the document type's `name`, `publicId`, and `systemId` properties will be set to empty strings.

- <a name="properties-document-element"></a>**`documentElement`** [Node](Node.md) *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-document-documentelement)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement)]

  Gets the document's root `Node`, or `null` if there is no root `Node` (such as when the `DOM` instance represents a document fragment).

### Standard

- <a name="properties-body"></a>**`body`** [Node](Node.md) — [[standard](https://html.spec.whatwg.org/multipage/dom.html#dom-document-body)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/body)]

  Gets the document's `<body>` element, or `null` if one doesn't exist. When setting, if the node's tag name is either `"BODY"` or `"FRAMESET"`, this will add the `Node` to the document's root node if the document doesn't already have a body element, or the existing body element will be replaced by the `Node`.

- <a name="properties-head"></a>**`head`** [Node](Node.md) *(read-only)* — [[standard](https://html.spec.whatwg.org/multipage/dom.html#dom-document-head)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/head)]

  Gets the document's `<head>` element, or `null` if one doesn't exist.

- <a name="properties-title"></a>**`title`** String — [[standard](https://html.spec.whatwg.org/multipage/dom.html#document.title)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/title)]

  Gets or sets the value of the document's `<title>` element if the document has a `<head>` element, creating the `<title>` element (when setting) if it doesn't exist.

## Methods

<a name="methods-create-cdata-section"></a>

```javascript
document.createCDATASection( data )
```

[[standard](https://dom.spec.whatwg.org/#dom-document-createcdatasection)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/createCDATASection)]

Creates a new `Node` of type `CDATA_SECTION_NODE`.

**Parameters**

- **`data`** String

  A `String` that is used as the contents of the CDATA section (eg. `" data "` in `<![CDATA[ data ]]>`).

**Return Value**

The new `Node`.

**Exceptions**

An `Error` is thrown if `data` contains the end sequence `]]>`.

----

<a name="methods-create-comment"></a>

```javascript
document.createComment( data )
```

[[standard](https://dom.spec.whatwg.org/#dom-document-createcomment)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/createComment)]

Creates a new `Node` of type `COMMENT_NODE`.

**Parameters**

- **`data`** String

  A `String` that is used as the contents of the comment.

  > **⚠️ Caution:** No check is performed for the sequence `-->`, which can result in the early termination of the comment when the document is output as text, making the remaining contents of the comment appear as text in the document.

**Return Value**

The new `Node`.

----

<a name="methods-create-document-type"></a>

```javascript
document.createDocumentType( name[, publicId[, systemId]] )
```

[[standard](https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType)]

Creates a new `Node` of type `DOCUMENT_TYPE_NODE`.

**Parameters**

- **`name`** String

  A `String` that is used as the document type's name (eg. `"html"` in `<!DOCTYPE html>`).

- **`publicId`** String *(optional)*

  A `String` that is used as the document type's public identifier. If this isn't a non-empty string, an empty string will be used instead.

- **`systemId`** String *(optional)*

  A `String` that is used as the document type's system identifier. If this isn't a non-empty string, an empty string will be used instead.

**Return Value**

The new `Node`.

----

<a name="methods-create-element"></a>

```javascript
document.createElement( tagName )
```

[[standard](https://dom.spec.whatwg.org/#dom-document-createelement)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)]

Creates a new `Node` of type `ELEMENT_NODE`.

**Parameters**

- **`tagName`** String

  A `String` that specifies the [`tagName`](Node.md#properties-tag-name) of the element (eg. `<name></name>`)

**Return Value**

The new `Node`, or `undefined` if the specified `tagName` parameter isn't a `String` or is an empty string.

----

<a name="methods-create-processing-instruction"></a>

```javascript
document.createProcessingInstruction( target, data )
```

[[standard](https://dom.spec.whatwg.org/#dom-document-createprocessinginstruction)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/createProcessingInstruction)]

Creates a new `Node` of type `PROCESSING_INSTRUCTION_NODE`.

**Parameters**

- **`target`** String

  A `String` representing the target of the processing instruction (eg. `"target"` in `<?target?>`).

- **`data`** String

  A `String` containing the data of the processing instruction (eg. `"data"` in `<?target data?>`). This string can be anything, except the sequence `?>` which indicates the end of the processing instruction node.

**Return Value**

The new `Node`.

**Exceptions**

An `Error` is thrown if either of the following is `true`:

- `target` is invalid — it must be a `String` that is a [valid XML name](https://www.w3.org/TR/REC-xml/#dt-name).
- `data` contains the end sequence `?>`.

----

<a name="methods-create-text-node"></a>

```javascript
document.createTextNode( text )
```

[[standard](https://dom.spec.whatwg.org/#dom-document-createtextnode)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode)]

Creates a new `Node` of type `TEXT_NODE`.

**Parameters**

- **`text`** String

  A `String` that is used as the contents of the new text node.

**Return Value**

The new `Node`.

----

<a name="methods-get-elements-by-name"></a>

```javascript
document.getElementsByName( name )
```

[[standard](https://html.spec.whatwg.org/multipage/#dom-document-getelementsbyname)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName)]

Gets all elements (`ELEMENT_NODE` type nodes) which have a `name` attribute that matches the specified `name` parameter string.

**Parameters**

- **`name`** String

  The `name` attribute of the elements to locate. The comparison **is** case sensitive.

**Return Value**

An `Array` of all elements in the document whose `name` attribute matches the specified name. The array can be empty if no elements matched.

----

### Node.js Only (Non-standard)

The below convenience methods read and parse the file "lib/entities.json" (which includes all standard HTML 5 entities) and are only available when using FauxDOM in Node.js.

> <a name="standard-entities-note"></a>**ℹ️ Note:** As the standard set of entities is extremely comprehensive, using the standard set can lead to potentially undesirable output, such as encoding new-line characters (which would normally be ignored by browsers) as `&NewLine;`. This sort of unintended encoding of entities can lead to rather broken looking documents.
>
> To avoid this, either create your document using the [`encodeEntities`](#option-encode-entities) option as a `RegExp` that matches only the entities you care about, or use a [custom set of entities](EntityEncoder.md#entities) that only defines the entities you care about.

----

<a name="methods-import-standard-entities"></a>

```javascript
document.importStandardEntities()
```

Sets the [`entities`](EntityEncoder.md#properties-entities) of this document's [`entityEncoder`](#properties-entity-encoder) to the standard set of HTML 5 entities.

----

<a name="methods-static-import-standard-entities"></a>

```javascript
DOM.importStandardEntities()
```

The static version of the above method. Sets [`EntityEncoder.defaultEntities`](EntityEncoder.md#properties-default-entities) to the standard set of HTML 5 entities.