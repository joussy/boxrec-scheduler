const chaiLib = require('chai');
////import 'mocha';
var expect = chaiLib.expect;
//var CartSummary = require('./../../src/part1/cart-summary');
describe('CartSummary', function () {
    it('res.length should be 3', function () {
        var res = [1, 2, 3];
        expect(res.length).to.equal(3);
    });
});