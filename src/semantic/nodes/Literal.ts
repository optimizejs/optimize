import {Literal, RegExpLiteral} from 'estree';
import {types} from 'recast';
import {isLiteralable} from '../../utils/Utils';
import {CompletionRecord, normalCompletion, RuleNormalCompletionRecordExpression} from '../domain/CompletionRecords';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {constant, RuleConstantExpression} from '../rules/Basic';
import {regExpCreate} from '../rules/BuiltIn';
import {RuleExpression} from '../rules/RuleExpression';

export function Literal(node: Literal): RuleExpression<CompletionRecord> { // TODO template literal
    if (isLiteralable(node.value)) {
        return normalCompletion(constant(new PrimitiveValue(node.value)));
    } else {
        const regex = (node as RegExpLiteral).regex;
        const pattern = constant(new PrimitiveValue(regex.pattern));
        const flags = constant(new PrimitiveValue(regex.flags));
        return normalCompletion(regExpCreate(pattern, flags));
    }
}

export function createLiteral(rule: RuleExpression<CompletionRecord>): Literal | null {
    if (rule instanceof RuleNormalCompletionRecordExpression) {
        const value = rule.value;
        if (value instanceof RuleConstantExpression && value.value instanceof PrimitiveValue) {
            return types.builders.literal(value.value.value);
        }
    }
    return null;
}
