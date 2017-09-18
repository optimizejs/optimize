var assert = require('assert');
var fs = require('fs');
var path = require('path');
var optimize = require('../target/optimize');

var calculate = path.resolve(__dirname, 'calculate');
describe('Optimize', function() {
    var files = fs.readdirSync(calculate);

    files.forEach(function(file) {
        if (file.indexOf('.optimized.js') === -1) {
            it(file, function() {
                var original = fs.readFileSync(path.resolve(calculate, file), 'UTF-8');
                var optimized = optimize(original);
                var expected = fs.readFileSync(path.resolve(calculate, optimizedName(file)), 'UTF-8');
                assert.strictEqual(optimized, expected);
            });
        }
    });
});

function optimizedName(file) {
    return file.substring(0, file.length - 3) + '.optimized.js';
}