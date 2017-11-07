import {Evaluation} from '../Evaluation';
import {VariableVisitor} from '../Executable';
import {Optimized} from '../Optimized';
import {RuleExpression} from './RuleExpression';
import {constant, RuleConstantExpression} from './RuleNoVarExpresion';

export interface Calculator<R, A, B, C = void> {
    calculate(a: A, b: B, c: C): R;
}

export class SimpleCalculator<R, A, B, C = void> implements Calculator<R, A, B, C> {
    constructor(readonly calculate: (a: A, b: B, c: C) => R) {
    }
}

export abstract class RuleAbstractParamExpression<R, A, B = void, C = void> extends RuleExpression<R> {
    readonly params: RuleExpression<any>[] = [];

    constructor(private a?: RuleExpression<A>, private b?: RuleExpression<B>, private c?: RuleExpression<C>) {
        super();
        this.push(a);
        this.push(b);
        this.push(c);
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<R>> {
        const optimized = this.params.map(p => p.execute(evaluation, confident));

        const parts = optimized.map(o => o.get());

        if (parts.findIndex(p => !(p instanceof RuleConstantExpression)) === -1) {
            const values = parts.map(p => (p as RuleConstantExpression<any>).value);
            return this.calculate(...values);
        }
        return Optimized.wrapIfOptimized(
            optimized,
            this,
            () => this.copy(...parts)
        );
    }

    visitUsedVariables(visit: VariableVisitor): void {
        for (const part of this.params) {
            part.visitUsedVariables(visit);
        }
    }

    protected abstract calculate(a?: A, b?: B, c?: C): Optimized<RuleExpression<R>>;

    protected abstract copy(a?: RuleExpression<A>, b?: RuleExpression<B>,
                            c?: RuleExpression<C>): RuleAbstractParamExpression<R, A, B, C>;

    private push(a?: RuleExpression<any>): void {
        if (a) {
            this.params.push(a);
        }
    }
}

export class UnknownExpression<T> extends RuleAbstractParamExpression<any, any, any, T> {
    protected calculate(a: any, b: any, c: any): Optimized<RuleExpression<T>> {
        return Optimized.original(this);
    }

    protected copy(a: RuleExpression<any>, b: RuleExpression<any>,
                   c: RuleExpression<any>): RuleAbstractParamExpression<any, any, any, T> {
        return new UnknownExpression(a, b, c);
    }
}

export class RuleParamExpression<R, A, B = void, C = void> extends RuleAbstractParamExpression<R, A, B, C> {
    constructor(readonly calculator: Calculator<R, A, B, C>, a: RuleExpression<A>, b?: RuleExpression<B>,
                c?: RuleExpression<C>) {
        super(a, b, c);
    }

    protected calculate(a: A, b: B, c: C): Optimized<RuleExpression<R>> {
        return Optimized.optimized(constant(this.calculator.calculate(a, b, c)));
    }

    protected copy(a: RuleExpression<A>, b: RuleExpression<B>,
                   c: RuleExpression<C>): RuleAbstractParamExpression<R, A, B, C> {
        return new RuleParamExpression(this.calculator, a, b, c);
    }
}

export const notImplementedCalculator = new SimpleCalculator(() => {
    throw new Error('Not implemented!');
});
