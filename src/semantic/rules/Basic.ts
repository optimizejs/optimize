import {CompletionRecord} from '../domain/CompletionRecords';
import {Evaluation} from './Evaluation';
import {Optimized} from './Optimized';
import {
    BackMapper,
    RuleBinaryExpression,
    RuleConstantExpression,
    RuleExpression,
    SimpleBinaryCalculator
} from './RuleExpression';
import {RuleFunction, RuleReturn} from './RuleStatements';

export class RuleCallExpression extends RuleExpression<CompletionRecord> {
    constructor(readonly fn: RuleFunction, readonly parameters: RuleExpression<any>[], mapper?: BackMapper) {
        super(mapper);
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
            () => new RuleCallExpression(optimizedFn.get(), params, this.mapper)
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

export function call(fn: RuleFunction, parameters: RuleExpression<any>[],
                     backMapper?: BackMapper): RuleExpression<CompletionRecord> {

    return new RuleCallExpression(fn, parameters, backMapper);
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
