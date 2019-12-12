# Node

The `Node` class is accessible as `DOM.Node`, not because it can be directly instantiated (trying will throw an error), but rather to give access to the [static node type constants](#node-type-constants) that are available on `Node`.

Unlike [the standard DOM API](https://dom.spec.whatwg.org/#interface-element), there is no separate [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element) class for elements. Instead, `Node` includes the necessary properties and methods to be able to take the place of the standard `Element` class, reducing complexity and code size.

## Table of Contents

- [Properties](#properties)
  - [Semi-standard](#semi-standard)
    - [attributes](#properties-attributes)
    - [childNodes](#properties-child-nodes)
  - [Standard](#standard)
    - [classList](#properties-class-list)
    - [className](#properties-class-name)
    - [firstChild](#properties-first-child)
    - [id](#properties-id)
    - [innerHtml](#properties-inner-html)
    - [lastChild](#properties-last-child)
    - [nextSibling](#properties-next-sibling)
    - [nodeName](#properties-node-name)
    - [nodeType](#properties-node-type)
    - [nodeValue](#properties-node-value)
    - [outerHtml](#properties-outer-html)
    - [ownerDocument](#properties-owner-document)
    - [parentNode](#properties-parent-node)
    - [previousSibling](#properties-previous-sibling)
    - [tagName](#properties-tag-name)
    - [textContent](#properties-text-content)
- [Methods](#methods)
  - [Non-standard](#non-standard)
    - [forEach](#methods-for-each)
  - [Semi-standard](#semi-standard-1)
    - [getRootNode](#methods-get-root-node)
  - [Standard](#standard-1)
    - [cloneNode](#methods-clone-node)
    - [Attributes](#attributes)
      - [getAttribute](#methods-get-attribute)
      - [getAttributeNames](#methods-get-attribute-names)
      - [hasAttribute](#methods-has-attribute)
      - [hasAttributes](#methods-has-attributes)
      - [removeAttribute](#methods-remove-attribute)
      - [setAttribute](#methods-set-attribute)
      - [toggleAttribute](#methods-toggle-attribute)
    - [Children](#children)
      - [appendChild](#methods-append-child)
      - [hasChildNodes](#methods-has-child-nodes)
      - [insertBefore](#methods-insert-before)
      - [removeChild](#methods-remove-child)
      - [replaceChild](#methods-replace-child)
    - [Node Retrieval](#node-retrieval)
      - [closest](#methods-closest)
      - [getElementById](#methods-get-element-by-id)
      - [getElementsByClassName](#methods-get-elements-by-class-name)
      - [getElementsByTagName](#methods-get-elements-by-tag-name)
      - [matches](#methods-matches)
      - [querySelector](#methods-query-selector)
      - [querySelectorAll](#methods-query-selector-all)
- [Node Type Constants](#node-type-constants)

## Properties

### Semi-standard

- <a name="properties-attributes"></a>**`attributes`** Object — [[standard](https://dom.spec.whatwg.org/#dom-element-attributes)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes)]

  For `ELEMENT_NODE` type nodes, this `Object` is a key/value pair of (mostly) strings that represent the names and values of each of the element's attributes. If an attribute was specified without a value, the value for the attribute in this `Object` will be the boolean value `true`. Unlike the standard, this `Object` is only indexable by attribute name, not by numeric index.

  For all other node types, the `attributes` property will not exist.

- <a name="properties-child-nodes"></a>**`childNodes`** Array — [[standard](https://dom.spec.whatwg.org/#dom-node-childnodes)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes)]

  An `Array` containing all of the children (of all node types) of this node. This property only exists on nodes of type `ELEMENT_NODE`, `DOCUMENT_NODE`, and `DOCUMENT_FRAGMENT_NODE`. For `DOCUMENT_NODE` type nodes, this `Array` should only ever include two nodes, the `<!DOCTYPE>` declaration and the [document's root element](DOM.md#properties-document-element).

### Standard

- <a name="properties-class-list"></a>**`classList`** [DOMTokenList](DOMTokenList.md) **or** Null *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-element-classlist)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)]

  Gets a [`DOMTokenList`](DOMTokenList.md) instance, for `ELEMENT_NODE` type nodes, containing the case-sensitive list of CSS class names assigned to this `Node`.

- <a name="properties-class-name"></a>**`className`** String — [[standard](https://dom.spec.whatwg.org/#dom-element-classname)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)]

  The space separated list of CSS class names assigned to this `Node`.

- <a name="properties-first-child"></a>**`firstChild`** Node **or** Null *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-node-firstchild)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild)]

  The first child node of this node, or `null` if this node has no children.

- <a name="properties-id"></a>**`id`** String — [[standard](https://dom.spec.whatwg.org/#dom-element-id)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/id)]

  Gets this node's `id` attribute, or an empty string if it either doesn't have one or this node isn't of type `ELEMENT_NODE`.

- <a name="properties-inner-html"></a>**`innerHTML`** String — [[standard](https://w3c.github.io/DOM-Parsing/#dom-innerhtml-innerhtml)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)]

  For `ELEMENT_NODE` type nodes, this gets or sets the HTML markup inside this node.

- <a name="properties-last-child"></a>**`lastChild`** Node **or** Null *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-node-lastchild)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/lastChild)]

  The last child node of this node, or `null` if this node has no children.

- <a name="properties-next-sibling"></a>**`nextSibling`** Node **or** Null *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-node-nextsibling)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling)]

  The next `Node`, in document order, that is a sibling to this node (ie. both nodes have the same parent node), or `null` if this node is the last child of its parent.

- <a name="properties-node-name"></a>**`nodeName`** String *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-node-nodename)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName)]

  Gets the name of this node, which is dependent on this node's type:

  | Node Type                   | Value                                                        |
  | --------------------------- | ------------------------------------------------------------ |
  | CDATA_SECTION_NODE          | `"#cdata-section"`                                           |
  | COMMENT_NODE                | `"#comment"`                                                 |
  | DOCUMENT_FRAGMENT_NODE      | `"#document-fragment"`                                       |
  | DOCUMENT_NODE               | `"#document"`                                                |
  | DOCUMENT_TYPE_NODE          | The value of this document type's `name` property            |
  | ELEMENT_NODE                | The value of this element's [`tagName`](#properties-tag-name) property |
  | PROCESSING_INSTRUCTION_NODE | The value of this processing instruction's `target` property |
  | TEXT_NODE                   | `"#text"`                                                    |

- <a name="properties-node-type"></a>**`nodeType`** [Node Type](#node-type-constants) [Number] *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-node-nodetype)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType)]

  One of the [node type constants](#node-type-constants) that represent the type of the node.

- <a name="properties-node-value"></a>**`nodeValue`** String **or** Null — [[standard](https://dom.spec.whatwg.org/#dom-node-nodevalue)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue)]

  This is the text content, as a `String`, for node types that are text-based (text nodes, comments, CDATA sections, and processing instructions). For all other node types, this property is `null`.

  > **⚠️ Caution:** For text-based nodes, setting this property to something other than a `String` could result in unexpected errors.

- <a name="properties-outer-html"></a>**`outerHTML`** String — [[standard](https://w3c.github.io/DOM-Parsing/#dom-element-outerhtml)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML)]

  For `ELEMENT_NODE` type nodes, this gets or sets the HTML markup that represents this node. Setting `outerHTML` will entirely replace this node with the result of parsing the specified string, or simply remove this node if the specified string isn't valid markup.

- <a name="properties-owner-document"></a>**`ownerDocument`** [DOM](DOM.md) **or** Null *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-node-ownerdocument)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument)]

  The top-level `DOM` object that contains this node, or `null` if this node is a `DOM` object.

- <a name="properties-parent-node"></a>**`parentNode`** Node **or** Null *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-node-parentnode)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode)]

  Gets the parent node of this node, or `null` if this node isn't attached as a child to any other node (ie. it was just created, or was removed).

- <a name="properties-previous-sibling"></a>**`previousSibling`** Node **or** Null *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-node-previoussibling)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/previousSibling)]

  The previous `Node`, in document order, that is a sibling to this node (ie. both nodes have the same parent node), or `null` if this node is the first child of its parent.

- <a name="properties-tag-name"></a>**`tagName`** String **or** Null *(read-only)* — [[standard](https://dom.spec.whatwg.org/#dom-element-tagname)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)]

  For `ELEMENT_NODE` type nodes, this gets the tag name of this node in upper case.

- <a name="properties-text-content"></a>**`textContent`** String — [[standard](https://dom.spec.whatwg.org/#dom-node-textcontent)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)]

  Gets the text content of this node and all of its child nodes, in document order, as a single `String` (excluding CDATA sections, comments, and processing instructions). Setting `textContent` will replace any child nodes of this node with the specified string as a new `Node` of type `TEXT_NODE`, or set the [`nodeValue`](#properties-node-value) to the specified string for text-based nodes.

## Methods

### Non-standard

<a name="methods-for-each"></a>

```javascript
node.forEach( callback[, type] )
```

Executes the specified `callback` function for each `Node` that is a descendent of this node, in document order. If the `callback` function returns the `Boolean` value `false`, `forEach()` will return and no further nodes will be visited.

**Parameters**

- **`callback`** Function

  The function to execute on each `Node`, with the following arguments:

  - **`current`** Node

    The current `Node` being processed.

  - **`parent`** Node

    The [`parentNode`](#properties-parent-node) of the current `Node`.

- **`type`** [Node Type](#node-type-constants) [Number] *(optional, default:* `ELEMENT_NODE`*)*

  A [node type constant](#node-type-constants) indicating which type of nodes to call the `callback` on, or `null` if you want to visit all nodes regardless of node type. Only one node type may be specified.

----

### Semi-standard

<a name="methods-get-root-node"></a>

```javascript
node.getRootNode()
```

[[standard](https://dom.spec.whatwg.org/#dom-node-getrootnode)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode)]

**Return Value**

The top most level `Node` that this node is a child of. This can be a `DOM` instance if this node is attached to a document, or it can be the same `Node` instance `getRootNode()` was called on if the node isn't attached to a document and isn't a child of another node.

----

### Standard

<a name="methods-clone-node"></a>

```javascript
node.cloneNode( [deep] )
```

[[standard](https://dom.spec.whatwg.org/#dom-node-clonenode)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode)]

Returns a duplicate of this node.

**Parameters**

- **`deep`** Boolean *(optional)*

  If specified as `true`, indicates whether all of this node's child hierarchy should also be cloned.

**Return Value**

The `Node` that was cloned from this node.

----

#### Attributes

Only `ELEMENT_NODE` type nodes can have attributes, so the below methods that work on attributes will treat all other node types as though they simply have no attributes (since they don't).

----

<a name="methods-get-attribute"></a>

```javascript
node.getAttribute( name )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-getattribute)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute)]

Returns the value of the specified attribute.

**Parameters**

- **`name`** String

  The name of the attribute whose value you want to get. This string will be lower-cased if you specify the [`lowerAttributeCase` option](DOM.md#option-lower-attribute-case) as `true` on the `DOM` instance this node belongs to.

**Return Value**

The value of the specified attribute, or `null` if the attribute doesn't exist. A non-`null` value will normally be a `String`, however it can also be the `Boolean` value `true` if the attribute exists, but doesn't have an explicit value (eg. the element `<button disabled></button>` has an attribute named "disabled" that doesn't have a explicit value).

----

<a name="methods-get-attribute-names"></a>

```javascript
node.getAttributeNames()
```

[[standard](https://dom.spec.whatwg.org/#dom-element-getattributenames)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames)]

Returns an `Array` of the names of the attributes on this node, in the order they were created on the node.

**Return Value**

An `Array` containing the names of this node's attributes, as `String` values. The array will be empty if the node has no attributes.

----

<a name="methods-has-attribute"></a>

```javascript
node.hasAttribute( name )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-hasattribute)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute)]

Returns whether this node has an attribute whose name matches the specified name.

**Parameters**

- **`name`** String

  The name of the attribute whose existence you want to query. This string will be lower-cased if you specify the [`lowerAttributeCase` option](DOM.md#option-lower-attribute-case) as `true` on the `DOM` instance this node belongs to.

**Return Value**

A `Boolean` indicating whether this node has the specified attribute.

----

<a name="methods-has-attributes"></a>

```javascript
node.hasAttributes()
```

[[standard](https://dom.spec.whatwg.org/#dom-element-hasattributes)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributes)]

Returns whether this node has any attributes.

**Return Value**

A `Boolean` indicating whether this node has any attributes.

----

<a name="methods-remove-attribute"></a>

```javascript
node.removeAttribute( name )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-removeattribute)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute)]

Removes the specified attribute from this node. If the specified attribute doesn't exist, this method does nothing.

**Parameters**

- **`name`** String

  The name of the attribute you want to remove. This string will be lower-cased if you specify the [`lowerAttributeCase` option](DOM.md#option-lower-attribute-case) as `true` on the `DOM` instance this node belongs to.

----

<a name="methods-set-attribute"></a>

```javascript
node.setAttribute( name, value )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-setattribute)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute)]

Sets the value of the specified attribute to the specified value, updating a pre-existing attribute with the same name or creating a new attribute.

**Parameters**

- **`name`** String

  The name of the attribute you want to set. This string will be lower-cased if you specify the [`lowerAttributeCase` option](DOM.md#option-lower-attribute-case) as `true` on the `DOM` instance this node belongs to.

- **`value`** String **or** Boolean

  The value to assign to the specified attribute. When `value` is a `String` or the `Boolean` value `true`, the attribute's value is set directly to `value`. In all other cases, `value` is coerced to a `String` and the attribute's value is set to the result of the coercion.

  A `Boolean` value of `true` is used to represent an attribute that exists, but has no explicit value. This is mostly useful when the node is output as text.

----

<a name="methods-toggle-attribute"></a>

```javascript
node.toggleAttribute( name[, force] )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-toggleattribute)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/toggleAttribute)]

Toggles the existence of the specified attribute (ie. the attribute is removed if it exists, otherwise it's added and set to the `Boolean` value `true`).

**Parameters**

- **`name`** String

  The name of the attribute you want to toggle. This string will be lower-cased if you specify the [`lowerAttributeCase` option](DOM.md#option-lower-attribute-case) as `true` on the `DOM` instance this node belongs to.

- **`force`** Boolean *(optional)*

  If specified, indicates whether to only add the specified attribute (when `force` is `true`), or only remove the specified attribute (when `force` is `false`).

**Return Value**

A `Boolean` indicating whether the specified attribute exists after the call to `toggleAtribute()`.

----

#### Children

The below methods that work on child nodes will only work on nodes that can have child nodes (nodes of type `ELEMENT_NODE`, `DOCUMENT_NODE`, and `DOCUMENT_FRAGMENT_NODE`). For any method that inserts a node in some fashion, if the inserted node is a document fragment (a `DOCUMENT_FRAGMENT_NODE` type node), all of the top-level children of the document fragment will be removed from the fragment and then inserted in place of the document fragment.

----

<a name="methods-append-child"></a>

```javascript
node.appendChild( child )
```

[[standard](https://dom.spec.whatwg.org/#dom-node-appendchild)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild)]

Adds the specified node `child` to the end of this node's [`childNodes`](#properties-child-nodes) array. If the specified node is already in a document hierarchy, it is first removed and then added to this node's children.

**Parameters**

- **`child`** Node

  The node to append to the end of this node's `childNodes` array.

**Return Value**

The `Node` that was appended, which is usually the node specified as `child`. If the specified node is a document fragment, the empty document fragment node will be returned.

----

<a name="methods-has-child-nodes"></a>

```javascript
node.hasChildNodes()
```

[[standard](https://dom.spec.whatwg.org/#dom-node-haschildnodes)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/hasChildNodes)]

Returns whether this node has any child nodes.

**Return Value**

A `Boolean` indicating whether this node has any child nodes.

----

<a name="methods-insert-before"></a>

```javascript
node.insertBefore( newChild, refChild )
```

[[standard](https://dom.spec.whatwg.org/#dom-node-insertbefore)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore)]

Inserts the node `newChild` into this node's [`childNodes`](#properties-child-nodes) array before the node `refChild`.

**Parameters**

- **`newChild`** Node

  The node to be inserted.

- **`refChild`** Node **or** Null

  The node before which the node `newChild` should be inserted. If `refChild` is `null`, `insertBefore()` will act exactly like [`appendChild()`](#methods-append-child). Otherwise, if `refChild` isn't a `Node`, or isn't a direct child of this node (the node `insertBefore()` was called on), the node `newChild` will not be inserted.

**Return Value**

The `Node` that was inserted, which is usually the node specified as `newChild`, or `null` if no node was inserted. If `newChild` is a document fragment, the empty document fragment node will be returned.

----

<a name="methods-remove-child"></a>

```javascript
node.removeChild( child )
```

[[standard](https://dom.spec.whatwg.org/#dom-node-removechild)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild)]

Removes the specified node from this node's [`childNodes`](#properties-child-nodes) array.

**Parameters**

- **`child`** Node

  The node to be removed. If the node isn't a direct child of this node (the node `removeChild()` was called on), the node `child` will not be removed.

**Return Value**

The `Node` that was removed, or `null` if no node was removed.

----

<a name="methods-replace-child"></a>

```javascript
node.replaceChild( newChild, oldChild )
```

[[standard](https://dom.spec.whatwg.org/#dom-node-replacechild)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild)]

Replaces the node `oldChild` with the node `newChild`.

**Parameters**

- **`newChild`** Node

  The node to replace the node `oldChild` with.

- **`oldChild`** Node

  The node being replaced. If the node isn't a direct child of this node (the node `replaceChild()` was called on), the node `oldChild` will not be replaced.

**Return Value**

The `Node` that was replaced, or `null` if no node was replaced.

----

#### Node Retrieval

<a name="methods-closest"></a>

```javascript
node.closest( selector )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-closest)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)]

Starting with this `Node`, `closest()` traverses the node hierarchy toward the root node looking for the first `ELEMENT_NODE` type node that matches the specified selector.

**Parameters**

- **`selector`** String

  The selector string to match against. See the [selectors documentation](Selectors.md) for a list supported selectors.

**Return Value**

The `Node` that was first matched by the specified selector, or `null` if no node matched.

**Exceptions**

A `SyntaxError` is thrown if the specified selector is invalid. The message of the `SyntaxError` will have a more detailed description of what exactly the error is, and the `stack` property of the error object will have information about where in the selector the error was encountered.

----

<a name="methods-get-element-by-id"></a>

```javascript
node.getElementById( id )
```

[[standard](https://dom.spec.whatwg.org/#dom-nonelementparentnode-getelementbyid)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById)]

Gets the first element (`Node` of type `ELEMENT_NODE`) which has an `id` attribute that matches the specified `id` parameter string.

**Parameters**

- **`id`** String

  The `id` attribute of the element to locate. The comparison **is** case sensitive.

**Return Value**

The `Node` whose `id` attribute matches the specified ID, or `null` if no element was found.

----

<a name="methods-get-elements-by-class-name"></a>

```javascript
node.getElementsByClassName( className )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-getelementsbyclassname)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName)]

Gets all elements (`Node` of type `ELEMENT_NODE`) which have a `class` attribute that contains the specified `className` parameter string.

**Parameters**

- **`className`** String

  One or more class names to locate, separated by whitespace. All class names must exist on an element for it to be considered matching. The comparison **is** case sensitive.

**Return Value**

An `Array` of all elements in the document whose `class` attribute contains the specified class name or names. The array can be empty if no elements matched.

----

<a name="methods-get-elements-by-tag-name"></a>

```javascript
node.getElementsByTagName( tagName )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-getelementsbytagname)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName)]

Gets all elements (`Node` of type `ELEMENT_NODE`) which have a [`tagName`](#properties-tag-name) that matches the specified `tagName` parameter string.

**Parameters**

- **`tagName`** String

  The `tagName` of the elements to locate. The comparison **is not** case sensitive.

**Return Value**

An `Array` of all elements in the document whose `tagName` matches the specified one. The array can be empty if no elements matched.

----

<a name="methods-matches"></a>

```javascript
node.matches( selector )
```

[[standard](https://dom.spec.whatwg.org/#dom-element-matches)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches)]

Return whether this node would be selected by the specified selector.

**Parameters**

- **`selector`** String

  The selector string to match against. See the [selectors documentation](Selectors.md) for a list supported selectors.

**Return Value**

A `Boolean` indicating whether this node would be selected by the specified selector.

**Exceptions**

A `SyntaxError` is thrown if the specified selector is invalid. The message of the `SyntaxError` will have a more detailed description of what exactly the error is, and the `stack` property of the error object will have information about where in the selector the error was encountered.

----

<a name="methods-query-selector"></a>

```javascript
node.querySelector( selector )
```

[[standard](https://dom.spec.whatwg.org/#dom-parentnode-queryselector)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector)]

Returns the first `ELEMENT_NODE` type node that matches the specified selector and is a descendent of this node.

**Parameters**

- **`selector`** String

  The selector string to match against. See the [selectors documentation](Selectors.md) for a list supported selectors.

**Return Value**

The `Node` that was first matched by the specified selector, or `null` if no node matched.

**Exceptions**

A `SyntaxError` is thrown if the specified selector is invalid. The message of the `SyntaxError` will have a more detailed description of what exactly the error is, and the `stack` property of the error object will have information about where in the selector the error was encountered.

----

<a name="methods-query-selector-all"></a>

```javascript
node.querySelectorAll( selector )
```

[[standard](https://dom.spec.whatwg.org/#dom-parentnode-queryselectorall)] [[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll)]

Returns an `Array` of `ELEMENT_NODE` type nodes that match the specified selector and are descendents of this node.

**Parameters**

- **`selector`** String

  The selector string to match against. See the [selectors documentation](Selectors.md) for a list supported selectors.

**Return Value**

An `Array` containing all nodes that matched the specified selector. The `Array` will be empty if no nodes matched.

**Exceptions**

A `SyntaxError` is thrown if the specified selector is invalid. The message of the `SyntaxError` will have a more detailed description of what exactly the error is, and the `stack` property of the error object will have information about where in the selector the error was encountered.

----

## Node Type Constants

| Constant                           | Value | Description                                                  |
| ---------------------------------- | :---: | ------------------------------------------------------------ |
| `Node.ELEMENT_NODE`                |   1   | An element node (such as `<p>` or `<div>`) that has a `tagName` property, along with supporting attributes and child nodes. |
| `Node.TEXT_NODE`                   |   3   | A text node that only stores plain text as a `String` in its `nodeValue` property. |
| `Node.CDATA_SECTION_NODE`          |   4   | A [CDATA section node](https://developer.mozilla.org/en-US/docs/Web/API/CDATASection), commonly used in XML documents to include portions of text without the need to escape the characters `<` and `&`. |
| `Node.PROCESSING_INSTRUCTION_NODE` |   7   | A [processing instruction node](https://developer.mozilla.org/en-US/docs/Web/API/ProcessingInstruction), commonly used in XML documents to embed application-specific instructions. These nodes have a `target` property rather than the `tagName` property of element nodes, and do not support attributes or child nodes. Unlike browsers, all other text inside the node (other than the target) is stored in the node's `nodeValue` property as a `String`. |
| `Node.COMMENT_NODE`                |   8   | A comment node (such as `<!-- comment -->`) that stores the text content of the comment in the node's `nodeValue` property as a `String`. |
| `Node.DOCUMENT_NODE`               |   9   | A document node, created by instantiating the [`DOM`](DOM.md) class. |
| `Node.DOCUMENT_TYPE_NODE`          |  10   | A document type node.                                        |
| `Node.DOCUMENT_FRAGMENT_NODE`      |  11   | A document fragment node, created by instantiating the [`DOM`](DOM.md) class without either a `<!DOCTYPE>` or an `<html>` element. |
