import {ArrowFunctionExpression, BlockStatement, FunctionExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function FunctionExpression(node: FunctionExpression): RuleExpression<CompletionRecord> {
    const params = node.params.map(param => trackOptimized(toRule(param)));
    const body = trackOptimized(toRule(node.body));
    return inNewScope([
        ...params.map(p => new RuleLetStatement('p', p)),
        new RuleLetStatement('b', getValue(body))
    ], () => types.builders.functionExpression(
        node.id ? node.id : null,
        params.map(param => param.toExpression()),
        body.toStatement() as BlockStatement,
        node.generator as boolean
    )); // TODO
}

export function ArrowFunctionExpression(node: ArrowFunctionExpression): RuleExpression<CompletionRecord> {
    const params = node.params.map(param => trackOptimized(toRule(param)));
    const body = trackOptimized(toRule(node.body));
    return inNewScope([
        ...params.map(p => new RuleLetStatement('p', p)),
        new RuleLetStatement('b', getValue(body))
    ], () => {
        const expression = node.expression;
        const paramExpressions = params.map(param => param.toExpression());
        if (expression) {
            return types.builders.arrowFunctionExpression(paramExpressions, body.toExpression(), true);
        } else {
            return types.builders.arrowFunctionExpression(paramExpressions, body.toNode(), false);
        }
    }); // TODO
}
