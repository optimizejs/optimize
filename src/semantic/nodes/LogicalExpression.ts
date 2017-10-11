import {LogicalExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../domain/CompletionRecords';
import {is} from '../domain/js/PrimitiveValue';
import {readVariable} from '../rules/Basic';
import {toBoolean} from '../rules/BuiltIn';
import {getValue} from '../rules/Others';
import {RuleExpression, trackOptimized} from '../rules/RuleExpression';
import {inNewScope, RuleIfStatement, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';

export function LogicalExpression(node: LogicalExpression): RuleExpression<CompletionRecord> {
    const leftRule = trackOptimized(toRule(node.left));
    const rightRule = trackOptimized(toRule(node.right));
    return inNewScope([
        new RuleLetStatement('lval', getValue(leftRule)),
        returnIfAbrupt('lval'),
        new RuleLetStatement('lbool', toBoolean(readVariable('lval'))),
        returnIfAbrupt('lbool'),
        new RuleIfStatement(
            is(readVariable('lbool'), node.operator === '||'),
            new RuleReturn(normalCompletion(readVariable('lval'))),
            new RuleReturn(getValue(rightRule))
        )
    ], () => types.builders.logicalExpression(node.operator, leftRule.toExpression(), rightRule.toExpression()));
}
