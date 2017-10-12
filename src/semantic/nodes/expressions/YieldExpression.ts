import {YieldExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {getValue} from '../../rules/Others';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function YieldExpression(node: YieldExpression): RuleExpression<CompletionRecord> {
    const argument = node.argument ? trackOptimized(toRule(node.argument)) : null;
    return inNewScope(
        argument ? [new RuleLetStatement('arg', getValue(argument))] : [],
        () => types.builders.yieldExpression(argument ? argument.toExpression() : null, node.delegate)
    ); // TODO
}
