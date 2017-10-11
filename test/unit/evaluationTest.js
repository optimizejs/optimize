var assert = require('assert');
var Evaluation = require('../../target/semantic/rules/Evaluation').Evaluation;

describe('Evaluation test', function() {
    var parent = new Evaluation();
    parent.assignUnknown('x');
    parent.assign('y', 1);

    it('assign', function() {
        var ev = new Evaluation();
        ev.assign('x', 1);

        assert.strictEqual(ev.read('x'), 1);
    });

    it('read non-existing', function() {
        var ev = new Evaluation();
        assert.throws(function() {
            ev.read('x');
        })
    });

    it('assign unknown', function() {
        var ev = new Evaluation();
        ev.assignUnknown('x');

        assert.throws(function() {
            ev.read('x')
        });
    });

    it('isKnown', function() {
        var ev = new Evaluation();
        ev.assignUnknown('x');
        ev.assign('y', 1);

        assert.strictEqual(ev.isKnownValue('x'), false);
        assert.strictEqual(ev.isKnownValue('y'), true);
    });

    it('parent read', function() {
        var ev = new Evaluation(parent);

        assert.strictEqual(ev.read('y'), 1);
        assert.throws(function() {
            ev.read('x');
        });
    });

    it('parent isKnown', function() {
        var ev = new Evaluation(parent);

        assert.strictEqual(ev.isKnownValue('y'), true);
        assert.strictEqual(ev.isKnownValue('x'), false);
    });

    it('hide parent', function() {
        var ev = new Evaluation(parent);
        ev.assign('x', 1);
        ev.assignUnknown('y');

        assert.strictEqual(ev.isKnownValue('y'), false);
        assert.strictEqual(ev.isKnownValue('x'), true);
    });

    it('merge', function() {
        var parent = new Evaluation();

        var ev1 = new Evaluation(parent);
        ev1.assign('same', 1);
        ev1.assign('different', 1);
        ev1.assign('ku', 1);
        ev1.assignUnknown('uk');
        ev1.assignUnknown('uu');
        ev1.assign('in1', 1);
        ev1.assignUnknown('un1');

        var ev2 = new Evaluation(parent);
        ev2.assign('same', 1);
        ev2.assign('different', 2);
        ev2.assignUnknown('ku');
        ev2.assign('uk', 1);
        ev2.assignUnknown('uu');
        ev2.assign('in2', 1);
        ev2.assignUnknown('un2');

        parent.merge(ev1, ev2);

        assert.strictEqual(parent.read('same'), 1);
        assert.strictEqual(parent.isKnownValue('different'), false);
        assert.strictEqual(parent.isKnownValue('ku'), false);
        assert.strictEqual(parent.isKnownValue('uk'), false);
        assert.strictEqual(parent.isKnownValue('uu'), false);
        assert.strictEqual(parent.isKnownValue('in1'), false);
        assert.strictEqual(parent.isKnownValue('in2'), false);
        assert.strictEqual(parent.isKnownValue('un1'), false);
        assert.strictEqual(parent.isKnownValue('un2'), false);

    });
});
