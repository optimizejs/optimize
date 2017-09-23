import {constant, RuleConstantExpression} from './Basic';
import {Evaluation} from './Evaluation';
import {Executable} from './Executable';
import {Optimized} from './Optimized';

export interface RuleExpression<T> extends Executable<RuleExpression<T>> {
    expression: T;
}

export class RuleUnaryExpression<A, T> implements RuleExpression<T> {
    expression: T;

    constructor(readonly argument: RuleExpression<A>, private calculate: (arg: A) => T) {
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<T>> {
        const optimizedArg = this.argument.execute(evaluation);
        const x = optimizedArg.get();
        if (x instanceof RuleConstantExpression) {
            return Optimized.optimized(constant(this.calculate(x.value as A)));
        }
        return optimizedArg.wrapIfOptimized(this, arg => new RuleUnaryExpression(arg, this.calculate));
    }
}

export class RuleBinaryExpression<L, R, T> implements RuleExpression<T> {
    expression: T;

    constructor(readonly left: RuleExpression<L>, readonly right: RuleExpression<R>,
                private calculate: (left: L, right: R) => T) {
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<T>> {
        const optimizedLeft = this.left.execute(evaluation);
        const optimizedRight = this.right.execute(evaluation);
        const left = optimizedLeft.get();
        const right = optimizedRight.get();
        if (left instanceof RuleConstantExpression && right instanceof RuleConstantExpression) {
            return Optimized.optimized(constant(this.calculate(left.value as L, right.value as R)));
        }
        return Optimized.wrapIfOptimized(
            [optimizedLeft, optimizedRight],
            this,
            () => new RuleBinaryExpression(left, right, this.calculate)
        );
    }
}
