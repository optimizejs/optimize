import {Literal, RegExpLiteral} from 'estree';
import {types} from 'recast';
import {isLiteralable} from '../../utils/Utils';
import {CompletionRecord, normalCompletion, NormalCompletionRecord} from '../domain/CompletionRecords';
import {newObject, RuleNewObjectExpression} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {constant, RuleConstantExpression} from '../rules/Basic';
import {RuleExpression, RuleUnaryExpression} from '../rules/RuleExpression';

class RegExpCreation {
    constructor(readonly pattern: RuleExpression<PrimitiveValue>, readonly flags: RuleExpression<PrimitiveValue>) {
    }
}

export function Literal(node: Literal): RuleExpression<CompletionRecord> { // TODO template literal
    if (isLiteralable(node.value)) {
        return constant(new NormalCompletionRecord(new PrimitiveValue(node.value)));
    } else {
        const regex = (node as RegExpLiteral).regex;
        const pattern = constant(new PrimitiveValue(regex.pattern));
        const flags = constant(new PrimitiveValue(regex.flags));
        return normalCompletion(newObject(new RegExpCreation(pattern, flags)));
    }
}

export function createLiteral(rule: RuleExpression<CompletionRecord>): Literal | null {
    if (rule instanceof RuleConstantExpression && rule.value instanceof NormalCompletionRecord) {
        const value = rule.value.value;
        if (value instanceof PrimitiveValue) {
            return types.builders.literal(value.value);
        }
    }

    if (rule instanceof RuleUnaryExpression) {
        const argument = rule.argument;
        if (argument instanceof RuleNewObjectExpression) {
            const p = argument.payload;
            if (p instanceof RegExpCreation) {
                if (p.pattern instanceof RuleConstantExpression && p.flags instanceof RuleConstantExpression) {
                    const pattern = (p.pattern.value as PrimitiveValue).value as string;
                    const flags = (p.flags.value as PrimitiveValue).value as string;
                    return types.builders.literal(new RegExp(pattern, flags));
                }
            }
        }
    }
    return null;
}
