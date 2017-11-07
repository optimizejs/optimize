import {DoWhileStatement, ForInStatement, WhileStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function DoWhileStatement(node: DoWhileStatement): RuleExpression<CompletionRecord> {
    const body = trackOptimized(toRule(node.body));
    const test = trackOptimized(toRule(node.test));

    return inNewScope([
            new RuleLetStatement('body', body),
            new RuleLetStatement('test', test)
        ],
        () => types.builders.doWhileStatement(body.toStatement(), test.toExpression())
    ); // TODO
}
