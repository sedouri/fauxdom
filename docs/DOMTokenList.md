# DOMTokenList

The `DOMTokenList` class, as used by FauxDOM, is only used to implement [`Node.classList`](Node.md#properties-class-list), even though the standard DOM API uses `DOMTokenList` to implement other properties as well (as described on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList)). Therefore, any reference to "tokens" in the below documentation can also be read as "CSS class name". However, for consistency with other, non-FauxDOM documentation, the word "token" continues to be used.

## Table of Contents

- [Properties](#properties)
  - [length](#properties-length)
  - [value](#properties-value)
- [Methods](#methods)
  - [Semi-standard](#semi-standard)
    - [supports](#methods-supports)
  - [Standard](#standard)
    - [add](#methods-add)
    - [contains](#methods-contains)
    - [item](#methods-item)
    - [remove](#methods-remove)
    - [replace](#methods-replace)
    - [toggle](#methods-toggle)

## Properties

- <a name="properties-length"></a>**`length`** Number *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-length)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/length)]

  Gets the number of tokens in the list as an integer.

- <a name="properties-value"></a>**`value`** String — [[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-value)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value)]

  Gets the value of the list as a `String` of all tokens in the list (in list order) separated by single ASCII space characters. Setting `value` clears the list and, if set to a string value, separates the string treating one or more white space characters in a row as delimiters, with each item in the resulting list (if valid) then being added to this `DOMTokenList` instance.

## Methods

### Semi-standard

<a name="methods-supports"></a>

```javascript
list.supports( token )
```

[[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-supports)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/supports)]

Determines if the specified token can exist in the list (ie. whether `token` contains only valid characters or not).

**Parameters**

- **`token`** String

  The token to verify.

**Return Value**

A `Boolean` indicating whether the token is valid and can be included in the list.

----

### Standard

<a name="methods-add"></a>

```javascript
list.add( token1[, token2[, ...]] )
```

[[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-add)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add)]

Adds the specified tokens to the list.

**Parameters**

- **`token...`** String

  One or more tokens to add to the list. If a specified token already exists, or [isn't valid](#methods-supports), it is ignored and nothing happens.

----

<a name="methods-contains"></a>

```javascript
list.contains( token )
```

[[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-contains)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains)]

Determines if the specified token exists in the list.

**Parameters**

- **`token`** String

  The token to check for the existence of in the list.

**Return Value**

A `Boolean` indicating whether the specified token exists in the list.

----

<a name="methods-item"></a>

```javascript
list.item( index )
```

[[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-item)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/item)]

Returns the item in the list at the specified numeric index.

**Parameters**

- **`index`** Number

  The index of the item in the list you want.

**Return Value**

The `String` item at the specified index, or `undefined` if no such index exists.

----

<a name="methods-remove"></a>

```javascript
list.remove( token1[, token2[, ...]] )
```

[[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-remove)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove)]

Removes the specified tokens from the list.

**Parameters**

- **`token...`** String

  One or more tokens to remove from the list. If a specified token doesn't exist, or [isn't valid](#methods-supports), it is ignored and nothing happens.

----

<a name="methods-replace"></a>

```javascript
list.replace( token, newToken )
```

[[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-replace)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/replace)]

Replaces an existing token with a new token.

**Parameters**

- **`token`** String

  The token you want to replace.

- **`newToken`** String

  The token you want to replace `token` with. If `newToken` is already in the list, `token` is simply removed from the list.

**Return Value**

A `Boolean` indicating whether the token `token` was successfully replaced by the token `newToken`.

----

<a name="methods-toggle"></a>

```javascript
list.toggle( token[, force] )
```

[[standard](https://dom.spec.whatwg.org/#dom-domtokenlist-toggle)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle)]

Toggles the existence of the specified token within the list (ie. `token` is removed from the list if it exists, otherwise it's added to the list).

**Parameters**

- **`token`** String

  The token you want to toggle.

- **`force`** Boolean *(optional)*

  If specified, indicates whether to only add the token (when `force` is `true`), or only remove the token (when `force` is `false`).

**Return Value**

A `Boolean` indicating whether `token` is in the list after the call to `toggle()`.