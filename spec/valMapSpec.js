/* global expect */

const keyA = {x: 123, y: 456};
const keyB = {x: 123, y: 456};
const keyC = {foo: 'bar'};

describe('Environment', function() {
    it('should have keyA and keyB with the same contents', function() {
        expect(keyA).toEqual(keyB);
    });

    it('should have keyA and keyC with the different contents', function() {
        expect(keyA).not.toEqual(keyC);
    });

    it('should have keyA and keyB with different references', function() {
        expect(keyA === keyB).toBeFalsy();
    });
});

describe('ValMap', function() {
    const ValMap = require('../index.js');

    var valmap;

    beforeEach(function() {
        valmap = new ValMap([ [keyA, 'foo'] ]);
    });

    it('should be a Map subclass', function() {
        expect(valmap instanceof Map).toBeTruthy();
    });

    describe('clear()', function() {
        it('should remove all entries', function() {
            valmap.clear();
            expect(valmap.get(keyA)).not.toBeDefined();
            expect(valmap.size).toEqual(0);
        });
    });

    describe('delete()', function() {
       it('should remove an entry that previously existed, using a key with the same value', function() {
           expect(valmap.has(keyA)).toBeTruthy();
           expect(valmap.delete(keyB)).toBeDefined();
           expect(valmap.has(keyA)).toBeFalsy();

           expect(valmap.size).toEqual(0);
       });
    });

    describe('has()', function() {
        it('should see that it has a key based on its value', function() {
            expect(valmap.has(keyB)).toBeTruthy();
        });

        it('should not see a key with a different value', function() {
            expect(valmap.has(keyC)).toBeFalsy();
        });
    });

    describe('get()', function() {
        it('should allow lookups with objects that have the same contents', function() {
            expect(valmap.get(keyB)).toEqual(valmap.get(keyA));
        });

        it('should not be able to lookup with a key that has different contents', function() {
            expect(valmap.get(keyC)).not.toEqual(valmap.get(keyA));
        });

        // This probably isn't desirable, but it is expected.
        it('should get a false positive lookup when getting a missing value, ' +
            'but undefined has been used as a key', function() {
            valmap.preventUndefinedKey = false;
            valmap.set(undefined, 'undefined value');
            expect(valmap.get('adfdsgfdsf')).toEqual(valmap.get(undefined));
        });
    });

    describe('set()', function() {
        it('should override existing values when a new key with the same contents is used', function() {
            expect(valmap.get(keyA)).toEqual('foo');
            valmap.set(keyB, 'bar');
            expect(valmap.get(keyA)).toEqual('bar');
        });

        it('should not override existing values when keys with different contents are used', function() {
            expect(valmap.get(keyA)).toEqual('foo');
            valmap.set(keyC, 'bar');
            expect(valmap.get(keyA)).toEqual('foo');
            expect(valmap.get(keyC)).toEqual('bar');
        });

        it('should disallow undefined as a key by default', function() {
            const setUndefined = function() {
                valmap.set(undefined, 1);
            };
            expect(setUndefined).toThrowError();
        });

        it('should allow undefined as a key when requested', function() {
            const setUndefined = function() {
                valmap.set(undefined, 1);
            };
            valmap.preventUndefinedKey = false;
            expect(setUndefined).not.toThrowError();
        });
    });

    describe('keys()', function() {
        it('should only include one key object per key-value', function() {
            valmap.set(keyB, 'qux');
            valmap.set(keyC, 'baz');
            const keys = Array.from(valmap.keys());
            expect(keys.length).toEqual(2);
        });
    });

    describe('values()', function() {
        it('should only include one value per key-value', function() {
            valmap.set(keyB, 'qux');
            valmap.set(keyC, 'baz');
            const values = Array.from(valmap.values());
            expect(values.length).toEqual(2);
        });
    });

    describe('entries()', function() {
        it('should only include one entry per key-value', function() {
            valmap.set(keyB, 'qux');
            valmap.set(keyC, 'baz');
            const entries = Array.from(valmap.entries());
            expect(entries.length).toEqual(2);
        });
    });

    describe('hashing', function() {
        class BarePoint {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }
        }
        class ToStringPoint extends BarePoint {
            toString() {
                return this.x + ',' + this.y;
            }
        }
        class HashPoint extends ToStringPoint {
            getValMapHash() {
                return 'Point(' + this.x + ',' + this.y + ')';
            }
        }

        it('should use getValMapHash if available', function() {
            const p = new HashPoint(1, 2);
            const hash = valmap._getKeyHash(p);
            expect(hash).toEqual('Point(1,2)');
        });

        it('should use toString if overriden, and getValMapHash is not defined', function() {
            const p = new ToStringPoint(1, 2);
            const hash = valmap._getKeyHash(p);
            expect(hash).toEqual('1,2');
        });

        it('should convert to JSON is nothing else is available', function() {
            const p = new BarePoint(1, 2);
            const hash = valmap._getKeyHash(p);
            expect(hash).toEqual('{"x":1,"y":2}');
        });

        it('should not attempt to use toString if disableToStringHash is set', function() {
            valmap.disableToStringHash = true;
            const p = new ToStringPoint(1, 2);
            const hash = valmap._getKeyHash(p);
            expect(hash).toEqual('{"x":1,"y":2}');
        });

        it('should not attempt to hash null or undefined', function() {
            const nullHash = valmap._getKeyHash(null);
            expect(nullHash).toBeNull();

            const undefinedHash = valmap._getKeyHash(undefined);
            expect(undefinedHash).not.toBeDefined();
        });
    });
});
