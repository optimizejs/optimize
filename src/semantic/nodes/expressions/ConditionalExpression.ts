import {ConditionalExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ConditionalExpression(node: ConditionalExpression): RuleExpression<CompletionRecord> {
    const test = trackOptimized(toRule(node.test));
    const consequent = trackOptimized(toRule(node.consequent));
    const alternate = trackOptimized(toRule(node.alternate));

    return inNewScope([
        new RuleLetStatement('test', getValue(test)),
        new RuleLetStatement('consequent', getValue(consequent)),
        new RuleLetStatement('alternate', getValue(alternate))
    ], () => types.builders.conditionalExpression(
        test.toExpression(),
        consequent.toExpression(),
        alternate.toExpression()
    )); // TODO
}
