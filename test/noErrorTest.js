var fs = require('fs');
var https = require('https');
var optimize = require('../target/optimize');

describe('Optimize big file with no error', function () {
    it('angular.js', function (done) {
        this.timeout(100000);
        https.get('https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-alpha.55/angular2-all-testing.umd.dev.js', function (response) {
            response.setEncoding('UTF-8');
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('end', function () {
                fs.writeFileSync(__dirname+'/../target/angular.js',body);
                var optimized = optimize(body);
                fs.writeFileSync(__dirname+'/../target/angular.optimized.js',optimized);
                console.log(body.length, optimized.length);
                done();
            });

            response.on('error', done);
        });
    });
});
