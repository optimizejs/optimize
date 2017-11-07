import {AssignmentPattern} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function AssignmentPattern(node: AssignmentPattern): RuleExpression<CompletionRecord> {
    const left = trackOptimized(toRule(node.left));
    const right = trackOptimized(toRule(node.right));

    return inNewScope([
        new RuleLetStatement('left', left),
        new RuleLetStatement('right', right)
    ], () => types.builders.assignmentPattern(left.toNode(), right.toExpression())); // TODO
}
