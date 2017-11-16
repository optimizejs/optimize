import {Expression, Literal, RegExpLiteral} from 'estree';
import {isLiteralable} from '../../../utils/Utils';
import {CompletionRecord, normalCompletion, NormalCompletionRecord} from '../../domain/CompletionRecords';
import {JSValue} from '../../domain/js/JSValue';
import {newObject} from '../../domain/js/ObjectValue';
import {PrimitiveValue} from '../../domain/js/PrimitiveValue';
import {RuleExpression} from '../../rules/expression/RuleExpression';
import {constant, RuleConstantExpression} from '../../rules/expression/RuleNoVarExpresion';
import {createLiteralFromValue, RegExpDescriptor} from '../NodeHelper';

export function Literal(node: Literal): RuleExpression<CompletionRecord> { // TODO template literal
    if (isLiteralable(node.value)) {
        return constant(new NormalCompletionRecord(new PrimitiveValue(node.value)));
    } else {
        const regex = (node as RegExpLiteral).regex;
        return normalCompletion(newObject(new RegExpDescriptor(regex.pattern, regex.flags)));
    }
}

export function createLiteral(rule: RuleExpression<CompletionRecord>): Expression | null {
    if (rule instanceof RuleConstantExpression && rule.value instanceof NormalCompletionRecord) {
        const value = rule.value.value;
        return createLiteralFromValue(value as JSValue);
    }
    return null;
}
