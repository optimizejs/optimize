import {Expression, ExpressionStatement} from 'estree';
import {types} from 'recast';
import {toNode, toRule} from '../../RuleMapper';
import {call, RuleCallExpression} from '../rules/Basic';
import {RuleFunction, RuleReturn} from '../rules/RuleStatements';

export function ExpressionStatement(node: ExpressionStatement): RuleFunction {
    return new RuleFunction([], [
        new RuleReturn(call(toRule(node.expression), []))
    ]);
}

export function createExpressionStatement(rule: RuleFunction): ExpressionStatement | null {
    if (rule.body.length !== 1) {
        return null;
    }
    const ret = rule.body[0];

    if (ret instanceof RuleReturn && ret.expression instanceof RuleCallExpression) {
        return types.builders.expressionStatement(toNode(ret.expression.fn) as Expression);
    }
    return null;
}
