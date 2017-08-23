import {ExpressionStatement} from 'estree';
import {evaluate} from '../rules/Basic';
import {RuleFunction, RuleReturn} from '../rules/RuleStatements';

export function ExpressionStatement(node: ExpressionStatement): RuleFunction {
    return new RuleFunction([], [
        new RuleReturn(evaluate(node.expression))
    ]);
}
