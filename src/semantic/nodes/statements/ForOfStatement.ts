import {ForInStatement, ForOfStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ForOfStatement(node: ForOfStatement): RuleExpression<CompletionRecord> {
    const left = trackOptimized(toRule(node.left));
    const right = trackOptimized(toRule(node.right));
    const body = trackOptimized(toRule(node.body));

    return inNewScope([
            new RuleLetStatement('left', left),
            new RuleLetStatement('right', right),
            new RuleLetStatement('body', body),
        ],
        () => types.builders.forOfStatement(left.toNode(), right.toExpression(), body.toStatement())
    ); // TODO
}
