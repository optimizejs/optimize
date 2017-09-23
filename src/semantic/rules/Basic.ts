import {CompletionRecord} from '../domain/CompletionRecords';
import {Evaluation} from './Evaluation';
import {Optimized} from './Optimized';
import {RuleBinaryExpression, RuleExpression} from './RuleExpression';
import {RuleFunction, RuleReturn} from './RuleStatements';

export class RuleConstantExpression<T> implements RuleExpression<T> {
    expression: T;

    constructor(readonly value: T) {
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<T>> {
        return Optimized.original(this);
    }
}

export class RuleCallExpression implements RuleExpression<CompletionRecord> {
    expression: CompletionRecord;

    constructor(readonly fn: RuleFunction, readonly parameters: RuleExpression<any>[]) {
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<CompletionRecord>> {
        const optimizedParams = this.parameters.map(param => param.execute(evaluation));
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

class RuleReadVariableExpression implements RuleExpression<any> {
    expression: any;

    constructor(private variable: string) {
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<any>> {
        if (evaluation.has(this.variable)) { // todo handle set to unknown, parent, etc.
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
    return new RuleBinaryExpression(expr1, expr2, (a, b) => a || b);
}

export function and(expr1: RuleExpression<boolean>, expr2: RuleExpression<boolean>): RuleExpression<boolean> {
    return new RuleBinaryExpression(expr1, expr2, (a, b) => a && b);
}

export function same<T>(x: RuleExpression<T>, y: RuleExpression<T>): RuleExpression<boolean> {
    return new RuleBinaryExpression(x, y, (l, r) => l === r);
}

export function constant<T>(value: T): RuleExpression<T> {
    return new RuleConstantExpression(value);
}
