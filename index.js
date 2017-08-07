class ValMap extends Map {
    constructor(opt_iterable) {
        super();

        this.keyStore = {};

        if (opt_iterable) {
            for (let [key, value] of opt_iterable) {
                this.set(key, value);
            }
        }
    }

    static _getKeyHash(key) {
        if (key === null || key === undefined) {
            return key;
        }
        if (typeof key.getValMapHash === 'function') {
            return key.getValMapHash();
        }
        // The default toString function isn't useful to identify an object.
        if (key.toString !== Object.prototype.toString) {
            return key.toString();
        }
        return JSON.stringify(key);
    }

    get(key) {
        const keyHash = ValMap._getKeyHash(key);
        var actualKey = this.keyStore[keyHash];
        return super.get(actualKey);
    }

    set(key, value) {
        const keyHash = ValMap._getKeyHash(key);
        if (this.keyStore[keyHash] === undefined) {
            this.keyStore[keyHash] = key;
        }
        var actualKey = this.keyStore[keyHash];
        return super.set(actualKey, value);
    }

    has(key) {
        const keyHash = ValMap._getKeyHash(key);
        var actualKey = this.keyStore[keyHash];
        return super.has(actualKey);
    }

    delete(key) {
        const keyHash = ValMap._getKeyHash(key);
        var actualKey = this.keyStore[keyHash];
        delete this.keyStore[keyHash];
        return super.has(actualKey);
    }
}
module.exports = ValMap;
