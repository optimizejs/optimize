import {SequenceExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {getValue} from '../../rules/Others';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function SequenceExpression(node: SequenceExpression): RuleExpression<CompletionRecord> {
    const expressions = node.expressions.map(expression => trackOptimized(toRule(expression)));
    return inNewScope([
        ...expressions.map(arg => new RuleLetStatement('expr', getValue(arg)))
    ], () => types.builders.sequenceExpression(expressions.map(element => element.toExpression()))); // TODO
}
