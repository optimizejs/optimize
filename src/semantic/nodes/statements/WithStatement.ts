import {WhileStatement, WithStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function WithStatement(node: WithStatement): RuleExpression<CompletionRecord> {
    const object = trackOptimized(toRule(node.object));
    const body = trackOptimized(toRule(node.body));

    return inNewScope([
            new RuleLetStatement('object', object),
            new RuleLetStatement('body', body)
        ],
        () => types.builders.withStatement(object.toExpression(), body.toStatement())
    ); // TODO
}
