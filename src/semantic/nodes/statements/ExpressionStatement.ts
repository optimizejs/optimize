import {ExpressionStatement} from 'estree';
import {types} from 'recast';
import {toExpression, toRule} from '../../../RuleMapper';
import {CompletionRecord, NormalCompletionRecord} from '../../domain/CompletionRecords';
import {call} from '../../rules/Basic';
import {GET_VALUE} from '../../rules/Others';
import {RuleConstantExpression, RuleExpression, trackOptimized} from '../../rules/RuleExpression';

export function ExpressionStatement(node: ExpressionStatement): RuleExpression<CompletionRecord> {
    const expression = trackOptimized(toRule(node.expression));
    return call(GET_VALUE, [expression], () => {
        return types.builders.expressionStatement(expression.toExpression());
    });
}

export function createExpressionStatement(rule: RuleExpression<CompletionRecord>): ExpressionStatement | null {
    if (rule instanceof RuleConstantExpression && rule.value instanceof NormalCompletionRecord) {
        return types.builders.expressionStatement(toExpression(rule));
    }
    return null;
}
