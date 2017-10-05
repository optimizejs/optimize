var assert = require('assert');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var optimize = require('../target/optimize');

var calculate = path.join(__dirname, 'calculate');
describe('Optimize', function () {
    var files = glob.sync(calculate + '/**/*.js', {ignore: '**/*.optimized.js'});

    files.forEach(function (file) {
        it(path.relative(calculate, file), function () {
            var original = fs.readFileSync(file, 'UTF-8');
            var optimized = optimize(original);
            var expected = fs.readFileSync(optimizedName(file), 'UTF-8');
            assert.strictEqual(optimized, expected);
        });
    });
});

function optimizedName(file) {
    return file.substring(0, file.length - 3) + '.optimized.js';
}