import {Literal, RegExpLiteral} from 'estree';
import {types} from 'recast';
import {isLiteralable} from '../../utils/Utils';
import {CompletionRecord, normalCompletion, NormalCompletionRecord} from '../domain/CompletionRecords';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {constant, RuleConstantExpression} from '../rules/Basic';
import {regExpCreate} from '../rules/BuiltIn';
import {RuleExpression} from '../rules/RuleExpression';

export function Literal(node: Literal): RuleExpression<CompletionRecord> { // TODO template literal
    if (isLiteralable(node.value)) {
        return constant(new NormalCompletionRecord(new PrimitiveValue(node.value)));
    } else {
        const regex = (node as RegExpLiteral).regex;
        const pattern = constant(new PrimitiveValue(regex.pattern));
        const flags = constant(new PrimitiveValue(regex.flags));
        return normalCompletion(regExpCreate(pattern, flags));
    }
}

export function createLiteral(rule: RuleExpression<CompletionRecord>): Literal | null {
    if (rule instanceof RuleConstantExpression && rule.value instanceof NormalCompletionRecord) {
        const value = rule.value.value;
        if (value instanceof PrimitiveValue) {
            return types.builders.literal(value.value);
        }
    }
    return null;
}
