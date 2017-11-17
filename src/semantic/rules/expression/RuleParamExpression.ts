import {Evaluation} from '../Evaluation';
import {VariableVisitor} from '../Executable';
import {Optimized} from '../Optimized';
import {RuleExpression} from './RuleExpression';
import {constant, RuleConstantExpression} from './RuleNoVarExpresion';

export type Calculator<R, A, B, C = void> = (a: A, b: B, c: C) => R;

class RuleAbstractParamExpression<R, A, B = void, C = void> extends RuleExpression<R> {
    readonly params: RuleExpression<any>[] = [];

    constructor(private calculate: Calculator<Optimized<RuleExpression<R>> | null, A, B, C>,
                private a?: RuleExpression<A>, private b?: RuleExpression<B>, private c?: RuleExpression<C>) {
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
            const result = (this.calculate as () => Optimized<RuleExpression<R>>)(...values);
            return result ? result : Optimized.original(this);
        }
        return Optimized.wrapIfOptimized(
            optimized,
            this,
            () => new RuleAbstractParamExpression(this.calculate, ...parts)
        );
    }

    visitUsedVariables(visit: VariableVisitor): void {
        for (const part of this.params) {
            part.visitUsedVariables(visit);
        }
    }

    private push(a?: RuleExpression<any>): void {
        if (a) {
            this.params.push(a);
        }
    }
}

const UNKNOWN_EXPRESSION: RuleExpression<any> =
    new RuleAbstractParamExpression(() => Optimized.original(UNKNOWN_EXPRESSION));

export function unknownExpression<R, A, B = void, C = void>(a: RuleExpression<A>, b?: RuleExpression<B>,
                                                            c?: RuleExpression<C>): RuleExpression<R> {
    return UNKNOWN_EXPRESSION;
}

export function maybeCalculableExpression<R, A, B, C>(calc: Calculator<Optimized<RuleExpression<R>> | null, A, B, C>,
                                                      a: RuleExpression<A>, b?: RuleExpression<B>,
                                                      c?: RuleExpression<C>): RuleExpression<R> {
    return new RuleAbstractParamExpression<R, A, B, C>(calc, a, b, c);
}

export function calculableExpression<R, A, B = void, C = void>(calculator: Calculator<R, A, B, C>, a: RuleExpression<A>,
                                                               b?: RuleExpression<B>,
                                                               c?: RuleExpression<C>): RuleExpression<R> {

    return new RuleAbstractParamExpression((aVal: A, bVal: B, cVal: C) => {
        return Optimized.optimized(constant(calculator(aVal, bVal, cVal)));
    }, a, b, c);
}

export const notImplementedCalculator = () => {
    throw new Error('Not implemented!');
};
