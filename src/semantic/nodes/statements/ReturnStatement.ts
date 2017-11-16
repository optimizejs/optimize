import {ReturnStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {
    CompletionRecord,
    returnCompletion,
    ReturnCompletionRecord,
    returnIfAbrupt
} from '../../domain/CompletionRecords';
import {PrimitiveValue} from '../../domain/js/PrimitiveValue';
import {readVariable} from '../../rules/Basic';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {constant, RuleConstantExpression} from '../../rules/expression/RuleNoVarExpresion';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement, RuleReturn} from '../../rules/RuleStatements';
import {createLiteralFromValue} from '../NodeHelper';

export function ReturnStatement(node: ReturnStatement): RuleExpression<CompletionRecord> {
    const argument = node.argument ? trackOptimized(toRule(node.argument)) : null;
    return inNewScope(argument ? [
        new RuleLetStatement('value', getValue(argument)),
        returnIfAbrupt('value'),
        new RuleReturn(returnCompletion(readVariable('value')))
    ] : [
        new RuleReturn(returnCompletion(constant(new PrimitiveValue(void 0))))
    ], () => types.builders.returnStatement(argument ? argument.toExpression() : null)); // TODO
}

export function createReturnStatement(rule: RuleExpression<CompletionRecord>): ReturnStatement | null {
    if (rule instanceof RuleConstantExpression && rule.value instanceof ReturnCompletionRecord) {
        const value = rule.value.value;

        const isUndefined = value instanceof PrimitiveValue && value.value === void 0;

        return types.builders.returnStatement(isUndefined ? null : createLiteralFromValue(value));
    }
    return null;
}
