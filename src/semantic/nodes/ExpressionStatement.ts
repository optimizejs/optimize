import {Expression, ExpressionStatement} from 'estree';
import {types} from 'recast';
import {toNode, toRule} from '../../RuleMapper';
import {CompletionRecord} from '../domain/CompletionRecords';
import {RuleCallExpression} from '../rules/Basic';
import {GET_VALUE, getValue} from '../rules/Others';
import {RuleExpression} from '../rules/RuleExpression';

export function ExpressionStatement(node: ExpressionStatement): RuleExpression<CompletionRecord> {
    return getValue(toRule(node.expression));
}

export function createExpressionStatement(rule: RuleExpression<CompletionRecord>): ExpressionStatement | null {
    if (!(rule instanceof RuleCallExpression) || rule.parameters.length !== 1) {
        return null;
    }
    if (rule.fn !== GET_VALUE) {
        return null;
    }

    return types.builders.expressionStatement(toNode(rule.parameters[0]) as Expression);
}
