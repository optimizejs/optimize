import {Literal, RegExpLiteral, UnaryExpression} from 'estree';
import {isLiteralable} from '../../../utils/Utils';
import {CompletionRecord, normalCompletion, NormalCompletionRecord} from '../../domain/CompletionRecords';
import {JSValue} from '../../domain/js/JSValue';
import {newObject} from '../../domain/js/ObjectValue';
import {PrimitiveValue} from '../../domain/js/PrimitiveValue';
import {constant, RuleConstantExpression, RuleExpression} from '../../rules/RuleExpression';
import {createLiteralFromValue, RegExpCreation} from '../NodeHelper';

export function Literal(node: Literal): RuleExpression<CompletionRecord> { // TODO template literal
    if (isLiteralable(node.value)) {
        return constant(new NormalCompletionRecord(new PrimitiveValue(node.value)));
    } else {
        const regex = (node as RegExpLiteral).regex;
        return normalCompletion(newObject(new RegExpCreation(regex.pattern, regex.flags)));
    }
}

export function createLiteral(rule: RuleExpression<CompletionRecord>): Literal | UnaryExpression | null {
    if (rule instanceof RuleConstantExpression && rule.value instanceof NormalCompletionRecord) {
        const value = rule.value.value;
        return createLiteralFromValue(value as JSValue);
    }
    return null;
}
