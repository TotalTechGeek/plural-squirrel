# Plural Squirrel

Looking for a simple library to handle your pluralization? 

Plural Squirrel allows you to write simple templates to handle plural text.

By using `[single|plural|zero]` syntax, you are able to easily simply distinguish how you'd like your string to be formatted for different inputs.  

```js
const dogs = plural`The dog[|s] [is|are] hungry.`

console.log(dogs(1)) // The dog is hungry.
console.log(dogs(5)) // The dogs are hungry.
```


You may wish to use additional arguments with your function, or output the number of items. `[#]` will insert the number of items, and `[0]` will refer to the first additional argument passed in. 

```js
const bananas = plural`[0] has eaten [#] banana[|s].`

console.log(bananas(1, 'Josh')) // Josh has eaten 1 banana.
console.log(bananas(2, 'Steve')) // Steve has eaten 2 bananas.
```


You may use the `#` symbol the `[single|plural]` syntax as well. 


```js
const bananas = plural`[0] has eaten [a|#] banana[|s].`

console.log(bananas(1, 'Josh')) // Josh has eaten a banana.
console.log(bananas(2, 'Steve')) // Steve has eaten 2 bananas.
```