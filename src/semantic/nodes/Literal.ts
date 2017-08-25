import {Literal, RegExpLiteral} from 'estree';
import {types} from 'recast';
import {isLiteralable} from '../../utils/Utils';
import {normalCompletion, RuleNormalCompletionRecordExpression} from '../CompletionRecords';
import {regExpCreate} from '../rules/BuiltIn';
import {RuleFunction, RuleReturn} from '../rules/RuleStatements';
import {constant, RuleConstantExpression} from '../values/PrimitiveValue';

export function Literal(node: Literal): RuleFunction { // TODO template literal
    if (isLiteralable(node.value)) {
        return new RuleFunction([], [
            new RuleReturn(normalCompletion(constant(node.value)))
        ]);
    } else {
        const regex = (node as RegExpLiteral).regex;
        return new RuleFunction([], [
            new RuleReturn(normalCompletion(regExpCreate(constant(regex.pattern), constant(regex.flags))))
        ]);
    }
}

export function createLiteral(rule: RuleFunction): Literal | null {
    if (rule.body.length !== 1) {
        return null;
    }
    const ret = rule.body[0];

    if (ret instanceof RuleReturn && ret.expression instanceof RuleNormalCompletionRecordExpression) {
        const value = ret.expression.value;
        if (value instanceof RuleConstantExpression) {
            return types.builders.literal(value.value);
        }
    }
    return null;
}
