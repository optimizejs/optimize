import {CompletionRecord} from '../domain/CompletionRecords';
import {Evaluation} from './Evaluation';
import {VariableVisitor} from './Executable';
import {BackMapper, RuleExpression} from './expression/RuleExpression';
import {RuleConstantExpression} from './expression/RuleNoVarExpresion';
import {RuleParamExpression, SimpleCalculator} from './expression/RuleParamExpression';
import {Optimized} from './Optimized';
import {RuleFunction, RuleReturn} from './RuleStatements';

export class RuleCallExpression extends RuleExpression<CompletionRecord> {
    constructor(readonly fn: RuleFunction, readonly parameters: RuleExpression<any>[], mapper?: BackMapper) {
        super(mapper);
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<CompletionRecord>> {
        const optimizedParams = this.parameters.map(param => param.execute(evaluation, confident));
        const params = optimizedParams.map(param => param.get());
        const optimizedFn = this.fn.call(params);

        const statements = optimizedFn.get().body;
        if (statements.length === 1) {
            const statement = statements[0];
            if (statement instanceof RuleReturn && statement.expression instanceof RuleConstantExpression) {
                return Optimized.optimized(statement.expression);
            }
        }

        return Optimized.wrapIfOptimized(
            [...optimizedParams, optimizedFn],
            this,
            () => new RuleCallExpression(optimizedFn.get(), params, this.mapper)
        );
    }

    visitUsedVariables(visit: VariableVisitor): void {
        for (const param of this.parameters) {
            param.visitUsedVariables(visit);
        }
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

    visitUsedVariables(visit: VariableVisitor): void {
        visit(this.variable);
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
    return new RuleParamExpression(new SimpleCalculator((a, b) => a || b), expr1, expr2);
}

export function and(expr1: RuleExpression<boolean>, expr2: RuleExpression<boolean>): RuleExpression<boolean> {
    return new RuleParamExpression(new SimpleCalculator((a, b) => a && b), expr1, expr2);
}

export function same<T>(x: RuleExpression<T>, y: RuleExpression<T>): RuleExpression<boolean> {
    return new RuleParamExpression<boolean, T, T>(new SimpleCalculator((l, r) => l === r), x, y);
}
