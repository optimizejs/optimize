import {CompletionRecord} from '../domain/CompletionRecords';
import {Evaluation} from './Evaluation';
import {Optimized} from './Optimized';
import {RuleBinaryExpression, RuleExpression, SimpleBinaryCalculator} from './RuleExpression';
import {RuleFunction, RuleReturn} from './RuleStatements';

export class RuleConstantExpression<T> extends RuleExpression<T> {
    constructor(readonly value: T) {
        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<T>> {
        return Optimized.original(this);
    }
}

export class RuleCallExpression extends RuleExpression<CompletionRecord> {
    constructor(readonly fn: RuleFunction, readonly parameters: RuleExpression<any>[]) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<CompletionRecord>> {
        const optimizedParams = this.parameters.map(param => param.execute(evaluation, confident));
        const params = optimizedParams.map(param => param.get());
        const optimizedFn = this.fn.call(params);

        for (const statement of optimizedFn.get().body) { // todo if-en belüli return kiszűrése
            if (statement instanceof RuleReturn && statement.expression instanceof RuleConstantExpression) {
                return Optimized.optimized(statement.expression);
            }
        }

        // todo optimize single return
        return Optimized.wrapIfOptimized(
            [...optimizedParams, optimizedFn],
            this,
            () => new RuleCallExpression(optimizedFn.get(), params)
        );
    }
}

class RuleReadVariableExpression extends RuleExpression<any> {
    constructor(private variable: string) {
        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<any>> {
        if (evaluation.isKnownValue(this.variable)) {
            return Optimized.optimized(new RuleConstantExpression(evaluation.read(this.variable)));
        }
        return Optimized.original(this);
    }
}

export function call(fn: RuleFunction, parameters: RuleExpression<any>[]): RuleExpression<CompletionRecord> {
    return new RuleCallExpression(fn, parameters);
}

export function readVariable(variable: string): RuleExpression<any> {
    return new RuleReadVariableExpression(variable);
}

export function or(expr1: RuleExpression<boolean>, expr2: RuleExpression<boolean>): RuleExpression<boolean> {
    return new RuleBinaryExpression(expr1, expr2, new SimpleBinaryCalculator((a, b) => a || b));
}

export function and(expr1: RuleExpression<boolean>, expr2: RuleExpression<boolean>): RuleExpression<boolean> {
    return new RuleBinaryExpression(expr1, expr2, new SimpleBinaryCalculator((a, b) => a && b));
}

export function same<T>(x: RuleExpression<T>, y: RuleExpression<T>): RuleExpression<boolean> {
    return new RuleBinaryExpression(x, y, new SimpleBinaryCalculator((l, r) => l === r));
}

export function constant<T>(value: T): RuleExpression<T> {
    return new RuleConstantExpression(value);
}
