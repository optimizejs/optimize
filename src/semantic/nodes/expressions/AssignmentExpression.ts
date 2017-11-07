import {AssignmentExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function AssignmentExpression(node: AssignmentExpression): RuleExpression<CompletionRecord> {
    const left = trackOptimized(toRule(node.left));
    const right = trackOptimized(toRule(node.right));
    return inNewScope([
        new RuleLetStatement('left', getValue(left)),
        new RuleLetStatement('right', getValue(right))
    ], () => types.builders.assignmentExpression(node.operator, left.toExpression(), right.toExpression())); // TODO
}
