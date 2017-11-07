import {WhileStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function WhileStatement(node: WhileStatement): RuleExpression<CompletionRecord> {
    const test = trackOptimized(toRule(node.test));
    const body = trackOptimized(toRule(node.body));

    return inNewScope([
            new RuleLetStatement('test', test),
            new RuleLetStatement('body', body)
        ],
        () => types.builders.whileStatement(test.toExpression(), body.toStatement())
    ); // TODO
}
