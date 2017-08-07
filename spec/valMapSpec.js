/* global expect */

describe('ValMap', function() {
    const ValMap = require('../index.js');
    
    it('should be a Map subclass', function() {
        const v = new ValMap();
        expect(v instanceof Map).toBeTruthy();
    });
    
    it('should allow lookups with objects that have the same contents', function() {
        const v = new ValMap();
        const keyA = {x: 123, y: 456};
        const keyB = {x: 123, y: 456};
        // Contents are the same, but the references aren't.
        expect(keyA).toEqual(keyB);
        expect(keyA === keyB).toBeFalsy();
        
        v.set(keyA, 'foo');
        expect(v.get(keyB)).toEqual('foo');
    });
});
