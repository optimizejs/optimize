import {BlockStatement, FunctionExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {getValue} from '../../rules/Others';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function FunctionExpression(node: FunctionExpression): RuleExpression<CompletionRecord> {
    const params = node.params.map(param => trackOptimized(toRule(param)));
    const body = trackOptimized(toRule(node.body));
    return inNewScope([
        new RuleLetStatement('b', getValue(body))
    ], () => types.builders.functionExpression(
        node.id ? node.id : null,
        params.map(param => param.toExpression()),
        body.toStatement() as BlockStatement
    )); // TODO
}
