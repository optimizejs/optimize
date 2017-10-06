import {ExpressionStatement} from 'estree';
import {types} from 'recast';
import {toExpression, toRule} from '../../RuleMapper';
import {CompletionRecord} from '../domain/CompletionRecords';
import {call, RuleConstantExpression} from '../rules/Basic';
import {GET_VALUE} from '../rules/Others';
import {RuleExpression, trackOptimized} from '../rules/RuleExpression';

export function ExpressionStatement(node: ExpressionStatement): RuleExpression<CompletionRecord> {
    const expression = trackOptimized(toRule(node.expression));
    return call(GET_VALUE, [expression], () => {
        return types.builders.expressionStatement(expression.toNode());
    });
}

export function createExpressionStatement(rule: RuleExpression<CompletionRecord>): ExpressionStatement | null {
    if (rule instanceof RuleConstantExpression) {
        return types.builders.expressionStatement(toExpression(rule));
    }
    return null;
}
