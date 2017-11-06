import {Expression, Node, Statement} from 'estree';
import {toExpression, toNodeByMapper, toStatement} from '../../RuleMapper';
import {CompletionRecord} from '../domain/CompletionRecords';
import {Evaluation} from './Evaluation';
import {Executable, VariableVisitor} from './Executable';
import {Optimized} from './Optimized';

export type BackMapper = () => Node;

export abstract class RuleExpression<T> implements Executable<RuleExpression<T>> {
    original: Node;

    constructor(readonly mapper?: BackMapper) {
    }

    abstract execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<T>>;

    abstract visitUsedVariables(visit: VariableVisitor): void;
}

export abstract class NoVarExpression<T> extends RuleExpression<T> {
    visitUsedVariables(visit: VariableVisitor): void { // leaf and has no variable usages
    }
}

export class RuleConstantExpression<T> extends NoVarExpression<T> {
    constructor(readonly value: T) {
        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<T>> {
        return Optimized.original(this);
    }
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

export abstract class RuleAbstractUnaryExpression<A, T> extends RuleExpression<T> {
    constructor(protected argument: RuleExpression<A>) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<T>> {
        const optimizedArg = this.argument.execute(evaluation, confident);
        const x = optimizedArg.get();
        if (x instanceof RuleConstantExpression) {
            return this.calculate(x.value);
        }
        return optimizedArg.wrapIfOptimized(this, arg => this.copy(arg));
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.argument.visitUsedVariables(visit);
    }

    protected abstract calculate(arg: A): Optimized<RuleExpression<T>>;

    protected abstract copy(arg: RuleExpression<A>): RuleAbstractUnaryExpression<A, T>;
}

export class RuleUnaryExpression<A, T> extends RuleAbstractUnaryExpression<A, T> {
    constructor(argument: RuleExpression<A>, readonly calculator: UnaryCalculator<A, T>) {
        super(argument);
    }

    protected calculate(arg: A): Optimized<RuleExpression<T>> {
        return Optimized.optimized(constant(this.calculator.calculate(arg)));
    }

    protected copy(arg: RuleExpression<A>): RuleUnaryExpression<A, T> {
        return new RuleUnaryExpression(arg, this.calculator);
    }
}

abstract class RuleAbstractBinaryExpression<L, R, T> extends RuleExpression<T> {
    constructor(private left: RuleExpression<L>, private right: RuleExpression<R>) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<T>> {
        const optimizedLeft = this.left.execute(evaluation, confident);
        const optimizedRight = this.right.execute(evaluation, confident);
        const left = optimizedLeft.get();
        const right = optimizedRight.get();
        if (left instanceof RuleConstantExpression && right instanceof RuleConstantExpression) {
            return this.calculate(left.value as L, right.value as R);
        }
        return Optimized.wrapIfOptimized(
            [optimizedLeft, optimizedRight],
            this,
            () => this.copy(left, right)
        );
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.left.visitUsedVariables(visit);
        this.right.visitUsedVariables(visit);
    }

    protected abstract calculate(left: L, right: R): Optimized<RuleExpression<T>>;

    protected abstract copy(left: RuleExpression<L>, right: RuleExpression<R>): RuleAbstractBinaryExpression<L, R, T>;
}

export class UnknownBinaryExpression<T> extends RuleAbstractBinaryExpression<any, any, T> {
    protected calculate(left: any, right: any): Optimized<RuleExpression<T>> {
        return Optimized.original(this);
    }

    protected copy(left: RuleExpression<any>, right: RuleExpression<any>): RuleAbstractBinaryExpression<any, any, T> {
        return new UnknownBinaryExpression(left, right);
    }
}

export interface BinaryCalculator<L, R, T> {
    calculate(left: L, right: R): T;
}

export class SimpleBinaryCalculator<L, R, T> implements BinaryCalculator<L, R, T> {
    constructor(readonly calculate: (left: L, right: R) => T) {
    }
}

export class RuleBinaryExpression<L, R, T> extends RuleAbstractBinaryExpression<L, R, T> {
    constructor(left: RuleExpression<L>, right: RuleExpression<R>,
                readonly calculator: BinaryCalculator<L, R, T>) {
        super(left, right);
    }

    protected calculate(left: L, right: R): Optimized<RuleExpression<T>> {
        return Optimized.optimized(constant(this.calculator.calculate(left, right)));
    }

    protected copy(left: RuleExpression<L>, right: RuleExpression<R>): RuleAbstractBinaryExpression<L, R, T> {
        return new RuleBinaryExpression(left, right, this.calculator);
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

    toNode<T extends Node>(): T {
        return toNodeByMapper(this.wrapped) as T;
    }

    toExpression(): Expression {
        return toExpression(this.wrapped);
    }

    toStatement(): Statement {
        return toStatement(this.wrapped);
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.wrapped.visitUsedVariables(visit);
    }
}

export function trackOptimized(argument: RuleExpression<CompletionRecord>): TrackOptimizedExpression {
    return new TrackOptimizedExpression(argument);
}

export function constant<T>(value: T): RuleExpression<T> {
    return new RuleConstantExpression(value);
}
