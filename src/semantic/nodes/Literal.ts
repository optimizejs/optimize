import {Literal, RegExpLiteral} from 'estree';
import {types} from 'recast';
import {isLiteralable} from '../../utils/Utils';
import {CompletionRecord, normalCompletion, RuleNormalCompletionRecordExpression} from '../CompletionRecords';
import {regExpCreate} from '../rules/BuiltIn';
import {RuleExpression} from '../rules/RuleExpression';
import {constant, RuleConstantExpression} from '../values/PrimitiveValue';

export function Literal(node: Literal): RuleExpression<CompletionRecord> { // TODO template literal
    if (isLiteralable(node.value)) {
        return normalCompletion(constant(node.value));
    } else {
        const regex = (node as RegExpLiteral).regex;
        return normalCompletion(regExpCreate(constant(regex.pattern), constant(regex.flags)));
    }
}

export function createLiteral(rule: RuleExpression<CompletionRecord>): Literal | null {
    if (rule instanceof RuleNormalCompletionRecordExpression) {
        const value = rule.value;
        if (value instanceof RuleConstantExpression) {
            return types.builders.literal(value.value);
        }
    }
    return null;
}
