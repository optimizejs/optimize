import {UnaryExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {getValue} from '../../rules/Others';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function UnaryExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));
    return inNewScope([
        new RuleLetStatement('ret', getValue(argument))
    ], () => types.builders.unaryExpression(node.operator, argument.toExpression())); // TODO
}
