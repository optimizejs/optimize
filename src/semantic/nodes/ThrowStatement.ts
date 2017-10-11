import {ThrowStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../RuleMapper';
import {CompletionRecord, returnIfAbrupt, throwCompletion, ThrowCompletionRecord} from '../domain/CompletionRecords';
import {readVariable} from '../rules/Basic';
import {getValue} from '../rules/Others';
import {RuleConstantExpression, RuleExpression, trackOptimized} from '../rules/RuleExpression';
import {inNewScope, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';
import {createLiteralFromValue} from './NodeHelper';

export function ThrowStatement(node: ThrowStatement): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));

    return inNewScope([
        new RuleLetStatement('exprValue', getValue(argument)),
        returnIfAbrupt('exprValue'),
        new RuleReturn(throwCompletion(readVariable('exprValue')))
    ], () => types.builders.throwStatement(argument.toExpression()));
}

export function createThrowStatement(rule: RuleExpression<CompletionRecord>): ThrowStatement | null {
    if (rule instanceof RuleConstantExpression && rule.value instanceof ThrowCompletionRecord) {
        return types.builders.throwStatement(createLiteralFromValue(rule.value.value));
    }
    return null;
}
