import {Literal, RegExpLiteral} from 'estree';
import {types} from 'recast';
import {isLiteralable} from '../../utils/Utils';
import {CompletionRecord, normalCompletion, NormalCompletionRecord} from '../domain/CompletionRecords';
import {newObject, ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {constant, RuleConstantExpression} from '../rules/Basic';
import {RuleExpression, RuleUnaryExpression} from '../rules/RuleExpression';

class RegExpCreation {
    constructor(readonly pattern: string, readonly flags: string) {
    }
}

export function Literal(node: Literal): RuleExpression<CompletionRecord> { // TODO template literal
    if (isLiteralable(node.value)) {
        return constant(new NormalCompletionRecord(new PrimitiveValue(node.value)));
    } else {
        const regex = (node as RegExpLiteral).regex;
        return normalCompletion(newObject(new RegExpCreation(regex.pattern, regex.flags)));
    }
}

export function createLiteral(rule: RuleExpression<CompletionRecord>): Literal | null {
    if (rule instanceof RuleConstantExpression && rule.value instanceof NormalCompletionRecord) {
        const value = rule.value.value;
        let literalValue;
        if (value instanceof PrimitiveValue) {
            literalValue = value.value;
        } else {
            const regExpCreation = (value as ObjectValue).payload as RegExpCreation;
            literalValue = new RegExp(regExpCreation.pattern, regExpCreation.flags);
        }
        return types.builders.literal(literalValue);
    }
    return null;
}
