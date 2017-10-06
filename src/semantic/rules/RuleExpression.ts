import {Expression, Node} from 'estree';
import {toExpression} from '../../RuleMapper';
import {CompletionRecord} from '../domain/CompletionRecords';
import {BackMapper, constant, RuleConstantExpression} from './Basic';
import {Evaluation} from './Evaluation';
import {Executable} from './Executable';
import {Optimized} from './Optimized';

export abstract class RuleExpression<T> implements Executable<RuleExpression<T>> {
    original: Node;

    constructor(readonly mapper?: BackMapper) {
    }

    abstract execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<T>>;
}

export interface UnaryCalculator<A, T> {
    calculate(argument: A): T;
}

export class SimpleUnaryCalculator<A, T> implements UnaryCalculator<A, T> {
    constructor(readonly calculate: (arg: A) => T) {
    }
}

export const notImplementedUnaryCalculator = new SimpleUnaryCalculator(() => {
    throw new Error('Not implemented!');
});

export class RuleUnaryExpression<A, T> extends RuleExpression<T> {
    constructor(readonly argument: RuleExpression<A>, readonly calculator: UnaryCalculator<A, T>) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<T>> {
        const optimizedArg = this.argument.execute(evaluation, confident);
        const x = optimizedArg.get();
        if (x instanceof RuleConstantExpression) {
            return Optimized.optimized(constant(this.calculator.calculate(x.value as A)));
        }
        return optimizedArg.wrapIfOptimized(this, arg => new RuleUnaryExpression(arg, this.calculator));
    }
}

export interface BinaryCalculator<L, R, T> {
    calculate(left: L, right: R): T;
}

export class SimpleBinaryCalculator<L, R, T> implements BinaryCalculator<L, R, T> {
    constructor(readonly calculate: (left: L, right: R) => T) {
    }
}

export class RuleBinaryExpression<L, R, T> extends RuleExpression<T> {
    constructor(readonly left: RuleExpression<L>, readonly right: RuleExpression<R>,
                readonly calculator: BinaryCalculator<L, R, T>) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<T>> {
        const optimizedLeft = this.left.execute(evaluation, confident);
        const optimizedRight = this.right.execute(evaluation, confident);
        const left = optimizedLeft.get();
        const right = optimizedRight.get();
        if (left instanceof RuleConstantExpression && right instanceof RuleConstantExpression) {
            return Optimized.optimized(constant(this.calculator.calculate(left.value as L, right.value as R)));
        }
        return Optimized.wrapIfOptimized(
            [optimizedLeft, optimizedRight],
            this,
            () => new RuleBinaryExpression(left, right, this.calculator)
        );
    }
}

export class TrackOptimizedExpression extends RuleExpression<CompletionRecord> {
    private wrapped: RuleExpression<CompletionRecord>;

    constructor(private argument: RuleExpression<CompletionRecord>) {
        super();
        this.wrapped = argument;
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<CompletionRecord>> {
        const optimized = this.argument.execute(evaluation, confident);
        if (optimized.isOptimized()) {
            this.wrapped = optimized.get();
        }
        return optimized;
    }

    toNode(): Expression {
        return toExpression(this.wrapped);
    }
}

export function trackOptimized(argument: RuleExpression<CompletionRecord>): TrackOptimizedExpression {
    return new TrackOptimizedExpression(argument);
}
