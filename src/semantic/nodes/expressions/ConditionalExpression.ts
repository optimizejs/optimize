import {ConditionalExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord, returnIfAbrupt} from '../../domain/CompletionRecords';
import {is} from '../../domain/js/PrimitiveValue';
import {readVariable} from '../../rules/Basic';
import {toBoolean} from '../../rules/BuiltIn';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleIfStatement, RuleLetStatement, RuleReturn} from '../../rules/RuleStatements';

export function ConditionalExpression(node: ConditionalExpression): RuleExpression<CompletionRecord> {
    const test = trackOptimized(toRule(node.test));
    const consequent = trackOptimized(toRule(node.consequent));
    const alternate = trackOptimized(toRule(node.alternate));

    return inNewScope([
        new RuleLetStatement('test', getValue(test)),
        returnIfAbrupt('test'),
        new RuleLetStatement('bool', toBoolean(readVariable('test'))),
        returnIfAbrupt('bool'),
        new RuleIfStatement(
            is(readVariable('bool'), true),
            new RuleReturn(getValue(consequent)),
            new RuleReturn(getValue(alternate))
        )
    ], () => types.builders.conditionalExpression(
        test.toExpression(),
        consequent.toExpression(),
        alternate.toExpression()
    )); // TODO
}
