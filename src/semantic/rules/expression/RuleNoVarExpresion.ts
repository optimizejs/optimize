import {Evaluation} from '../Evaluation';
import {VariableVisitor} from '../Executable';
import {Optimized} from '../Optimized';
import {RuleExpression} from './RuleExpression';

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

export function constant<T>(value: T): RuleExpression<T> {
    return new RuleConstantExpression(value);
}
