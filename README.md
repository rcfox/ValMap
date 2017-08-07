# ValMap - The ES6 Map that I expected

## The Problem
The `Map` object introduced in ES6 allows you to use arbitrary objects as keys for a dictionary datastructure,
as opposed to `Object` which only allows strings for keys. This is great for more-closely capturing the
semantics of your algorithm. However, for whatever reason, `Map` only considers keys equal according to the
"SameValueZero" algorithm: essentially, `NaN` is the same as `NaN` (even though `NaN !== NaN`) and `-0` is
the same as `+0`. Otherwise, keys are equal if they compare the same with `===`.

That means that no two objects will appear to be equal in a `Map`:

```
const mymap = new Map();
mymap.set({foo: 'bar'}, 'quz');
mymap.get({foo: 'bar'}) === undefined; // true
```

This was surprising to me, and seems to limit the usefulness of `Map`.

## A Solution

In Python, any hashable object can be used as a dictionary key, and objects that hash to the same value can be used
interchangeably as keys. "Hashable" more-or-less boils down to whether a `__hash__` function is defined for the
object.

With that in mind, what if we hashed the key objects and always just referred to the first object we get for
each hash?

`ValMap` has three possible ways of hashing your various objects:

1. getValMapHash()
    * This is the preferred method for objects that you control. You can return a string that identifies your objects
as uniquely as you want, with no concern for how it will show up elsewhere.
2. toString()
    * If your toString function already does a good job of uniquely identifying your objects, there's no need to change
anything. Note: the default `Object.prototype.toString` will be skipped, and hashing will move on to option 3.
3. JSON.stringify()
    * If you don't want to add methods, or you can't change the object's source, a full JSON dump will capture the
entire structure of your data.

If you don't want to define getValMapHash, and your toString isn't a good enough uniquifier, you can set
`mymap.disableToStringHash = true` to skip the toString call and dump to JSON.

```
const mymap = new Map();
mymap.set({foo: 'bar'}, 'quz');
mymap.get({foo: 'bar'}) === 'quz'; // true
```

Besides the hashing, `ValMap` is meant as a drop-in replacement for `Map`, and uses the same interface.
See the [Map MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

## Caveats

1. `Map` supports using `undefined` as a key. However, `ValMap` can't distinguish between a result with `undefined`
as a key, and a result where nothing is found.
    * If you absolutely must use `undefined` as a key, you can set `mymap.preventUndefinedKey = false`.
2. Mutating an object after it's been used as a key is a bad idea. It will still be associated with its old hash value.
3. Creating a new object every time you access into the ValMap will likely create a lot of garbage.
