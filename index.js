class ValMap extends Map {
    constructor(opt_iterable) {
        super();

        this.keyStore = {};

        // Using toString could be problematic if it doesn't sufficiently identify an object.
        this.disableToStringHash = false;

        // Using undefined as a key will result in any lookup-misses returning undefined's value.
        // That's probably a bad thing, but Map itself does work with undefined, so we can enable if needed.
        this.preventUndefinedKey = true;

        if (opt_iterable) {
            if (typeof opt_iterable[Symbol.iterator] === 'function') {
                for (let [key, value] of opt_iterable) {
                    this.set(key, value);
                }
            } else {
                throw new Error('expected iterable of [ [key, value], ... ]');
            }
        }
    }

    _getKeyHash(key) {
        if (key === null || key === undefined) {
            return key;
        }
        if (typeof key.getValMapHash === 'function') {
            return key.getValMapHash();
        }
        // The default toString function isn't useful to identify an object.
        if (!this.disableToStringHash && key.toString !== Object.prototype.toString) {
            return key.toString();
        }
        return JSON.stringify(key);
    }

    get(key) {
        const keyHash = this._getKeyHash(key);
        var actualKey = this.keyStore[keyHash];
        return super.get(actualKey);
    }

    set(key, value) {
        if (key === undefined && this.preventUndefinedKey) {
            throw new Error('Using undefined as a key will result in false positive lookups for missing keys. ' +
                            'If you really need this, set preventUndefinedKey = false on this ValMap.');
        }
        const keyHash = this._getKeyHash(key);
        if (this.keyStore[keyHash] === undefined) {
            this.keyStore[keyHash] = key;
        }
        var actualKey = this.keyStore[keyHash];
        return super.set(actualKey, value);
    }

    has(key) {
        const keyHash = this._getKeyHash(key);
        var actualKey = this.keyStore[keyHash];
        return super.has(actualKey);
    }

    delete(key) {
        const keyHash = this._getKeyHash(key);
        var actualKey = this.keyStore[keyHash];
        delete this.keyStore[keyHash];
        return super.delete(actualKey);
    }
}
module.exports = ValMap;
