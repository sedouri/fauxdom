# Selectors

While FauxDOM supports querying node hierarchies with selectors using [`Node.closest()`](Node.md#methods-closest), [`Node.matches()`](Node.md#methods-matches), [`Node.querySelector()`](Node.md#methods-query-selector), and [`Node.querySelectorAll()`](Node.md#methods-query-selector-all), not all of the selectors defined by the [Selectors Level 4 API standard](https://drafts.csswg.org/selectors-4/) are supported. While many of the unsupported selectors simply make no sense to include in FauxDOM because they require visual presentation information to work (FauxDOM isn't a renderer, so simply doesn't have this information), other selectors simply aren't supported **yet**.

The below table lists all of the selectors that FauxDOM either currently supports, or will support in a future version (a "Status" of "not yet implemented").

| Selector                               | Status                | Notes                                                        |
| -------------------------------------- | :-------------------- | ------------------------------------------------------------ |
| *descendent&nbsp;combinator*           | implemented           | This is the ASCII space character " ".                       |
| `>`<br>*child&nbsp;combinator*         | implemented           |                                                              |
| `+`<br>*next-sibling combinator*       | implemented           |                                                              |
| `~`<br>*subsequent-sibling combinator* | implemented           |                                                              |
| *tag&nbsp;name&nbsp;selector*          | implemented           |                                                              |
| `*`<br>*universal&nbsp;selector*       | implemented           |                                                              |
| `.`<br>*class&nbsp;selectors*          | implemented           |                                                              |
| `#`<br>*id&nbsp;selectors*             | implemented           |                                                              |
| `[]`<br>*attribute&nbsp;selectors*     | implemented           | All forms of the attribute selector have been fully implemented, including the case-sensitivity syntax. |
| `,`<br>*selector&nbsp;lists*           | implemented           |                                                              |
| `:is()`                                | implemented           |                                                              |
| `:not()`                               | implemented           |                                                              |
| `:where()`                             | partially implemented | This is simply an alias of `:is()`  since selector specificity isn't implemented as it only applies to styling a document. |
| `:has()`                               | implemented           |                                                              |
| `:scope`                               | implemented           |                                                              |
| `:enabled`                             | partially implemented | This checks for the **absence** of the `"disabled"` attribute on `<button>`, `<input>`, `<select>`, `<textarea>`, `<optgroup>`, `<option>`, and `<fieldset>` elements. |
| `:disabled`                            | partially implemented | This checks for the **existence** of the `"disabled"` attribute on `<button>`, `<input>`, `<select>`, `<textarea>`, `<optgroup>`, `<option>`, and `<fieldset>` elements. |
| `:checked`                             | implemented           | This checks for the **existence** of the `"checked"` attribute on `<input>` elements of type `"checkbox"` and `"radio"`, and the `"selected"` attribute on `<option>` elements. |
| `:required`                            | implemented           | This checks for the **existence** of the `"required"` attribute on `<input>`, `<select>`, and `<textarea>` elements. |
| `:optional`                            | implemented           | This checks for the **absence** of the `"required"` attribute on `<input>`, `<select>`, and `<textarea>` elements. |
| `:root`                                | implemented           |                                                              |
| `:empty`                               | implemented           |                                                              |
| `:nth-child()`                         | implemented           | This includes the `of <selector>` syntax from [Selectors Level 4](https://drafts.csswg.org/selectors-4/#the-nth-child-pseudo). |
| `:nth-last-child()`                    | implemented           | This includes the `of <selector>` syntax from [Selectors Level 4](https://drafts.csswg.org/selectors-4/#the-nth-child-pseudo). |
| `:first-child`                         | implemented           |                                                              |
| `:last-child`                          | implemented           |                                                              |
| `:only-child`                          | implemented           |                                                              |
| `:nth-of-type()`                       | implemented           |                                                              |
| `:nth-last-of-type()`                  | implemented           |                                                              |
| `:first-of-type`                       | implemented           |                                                              |
| `:last-of-type`                        | implemented           |                                                              |
| `:only-of-type`                        | implemented           |                                                              |