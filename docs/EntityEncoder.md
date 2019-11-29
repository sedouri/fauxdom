# EntityEncoder

`EntityEncoder` is used by FauxDOM to encode and decode HTML entities. By setting the [`entities`](#properties-entities) property, you can specify which entities should be encoded and decoded, allowing for entirely custom entities if you choose.

The `EntityEncoder` class is accessible as `DOM.EntityEncoder`, giving access to the static [`defaultEntities`](#properties-default-entities) property and allowing you to instantiate the class if you wish to perform entity encoding/decoding on your own.

## Table of Contents

- [Construction](#construction)
- [Properties](#properties)
  - [defaultEntities](#properties-default-entities)
  - [entities](#properties-entities)
- [Methods](#methods)
  - [encode](#methods-encode)
  - [decode](#methods-decode)
- [Entities](#entities)

## Construction

```javascript
new EntityEncoder( [entities] )
```

**Parameters**

- **`entities`** [Entities](#entities), EntityEncoder, **or** String *(optional, default:* `"default"`*)*

  The set of entities (as either an [entities](#entities) object or a previously created `EntityEncoder` instance) that this `EntityEncoder` instance will use to encode and decode entities. This can also be the `String` value `"default"` which will cause this `EntityEncoder` instance to use the current set of default entities.

## Properties

- <a name="properties-default-entities"></a>**`defaultEntities`** [Entities](#entities), EntityEncoder, **or** Null *(static, write-only)*

  The set of entities that new `EntityEncoder` instances will use when they are set to use the default set of entities. Setting this to `null` will set the default entities back to the basic set of entities that it started as:

  - `&amp;` — *ampersand* (&amp;),
  - `&apos;` — *apostrophe* (&apos;),
  - `&copy;` — *copyright* (&copy;),
  - `&gt;` — *greater than* (&gt;),
  - `&lt;` — *less than* (&lt;),
  - `&nbsp;` — *non-breaking space* (&nbsp;), and
  - `&quot;` — *quotation mark* (&quot;).

  Changing `defaultEntities` will have no effect on pre-existing `EntityEncoder` instances, unless you explicitly set their `entities` property to `"default"` afterwards.

- <a name="properties-entities"></a>**`entities`** [Entities](#entities), EntityEncoder, **or** String *(write-only)*

  The set of entities that this `EntityEncoder` instance will use to encode and decode entities. This can also be set to the `String` value `"default"` which will cause this `EntityEncoder` instance to use the current set of default entities.

## Methods

<a name="methods-encode"></a>

```javascript
entities.encode( string[, what] )
```

Encodes the specified string, based on the `entities` of this EntityEncoder instance, turning characters into entity references (eg. `"&"` into `"&amp;"`).

**Parameters**

- **`string`** String

  The string to be encoded.

- **`what`** RegExp *(optional)*

  A [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) that, if specified, is used to select the characters that will be encoded. If text is selected that doesn't have an entity associated with it, no encoding will be done on the selected text.

**Return Value**

The `String` that has been encoded.

----

<a name="methods-decode"></a>

```javascript
entities.decode( string )
```

Decodes the specified string, based on the `entities` of this EntityEncoder instance, turning entity references into characters (eg. `"&amp;"` into `"&"`).

**Parameters**

- **`string`** String

  The string to be decoded.

**Return Value**

The `String` that has been decoded.

----

## Entities

Which entities can be encoded and decoded can be customized with an object that consists of entity names as the object's keys and entity characters as the corresponding values. The entity characters can be specified either directly as a `String` (optionally with multiple characters), or as a numeric code point.

For instance, using the object:

```json
{
    "Space": 32,
    "Jay": "J",
    "bns": "beans"
}
```

would encode `"Jumping jellybeans"` as `"&Jay;umping&Space;jelly&bns;"`, and decode `"&Jay;ack's&Space;&bns;talk"` as `"Jack's beanstalk"`.

This format was chosen specifically to be 100% compatible with the JSON data file "entities.json" in the popular NPM module [entities](https://www.npmjs.com/package/entities) by Felix Böhm in case your project already happens to include it. If you have access to this file (found in lib/maps inside entities' directory, as of version 2.0.0), you can `JSON.parse()` the contents of the file, using the result as the entities for FauxDOM's `EntityEncoder`.

If your project doesn't include Felix's entities module, FauxDOM has its [own variants](../README.md#entities-variants) of this same data, automatically downloaded from the [WHATWG's HTML spec](https://html.spec.whatwg.org/entities.json) and processed to be as small as possible by the [entities.js script](../scripts/entities.js).