import {BinaryExpression, Expression} from 'estree';
import {types} from 'recast';
import {toNode, toRule} from '../../RuleMapper';
import {
    CompletionRecord,
    normalCompletion,
    returnIfAbrupt,
    RuleNormalCompletionRecordExpression
} from '../domain/CompletionRecords';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {call, readVariable, RuleCallExpression} from '../rules/Basic';
import {toNumber} from '../rules/BuiltIn';
import {getValue} from '../rules/Others';
import {RuleExpression} from '../rules/RuleExpression';
import {RuleFunction, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';

export function BinaryExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    switch (node.operator) {
        case '*':
        case '/':
        case '%':
            return MultiplicativeExpression(node);
        default:
            throw new Error('Unsupported operator: ' + node.operator);
    }
}

class RuleMultiplicativeExpression implements RuleExpression<PrimitiveValue> {
    expression: PrimitiveValue;

    constructor(readonly operator: string, readonly left: RuleExpression<PrimitiveValue>,
                readonly right: RuleExpression<PrimitiveValue>) {

    }
}

function MultiplicativeExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    return call(new RuleFunction([], [
        new RuleLetStatement('leftValue', getValue(toRule(node.left))),
        returnIfAbrupt('leftValue'),
        new RuleLetStatement('rightValue', getValue(toRule(node.right))),
        returnIfAbrupt('rightValue'),
        new RuleLetStatement('lnum', toNumber(readVariable('leftValue'))),
        returnIfAbrupt('lnum'),
        new RuleLetStatement('rnum', toNumber(readVariable('rightValue'))),
        returnIfAbrupt('rnum'),
        new RuleReturn(normalCompletion(new RuleMultiplicativeExpression(
            node.operator,
            readVariable('lnum'),
            readVariable('rnum')
        )))
    ]), []);
}

export function createBinaryExpression(rule: RuleExpression<CompletionRecord>): BinaryExpression | null {
    if (!(rule instanceof RuleCallExpression) || rule.parameters.length !== 0) {
        return null;
    }
    const fn = rule.fn;
    if (fn.body.length !== 9) {
        return null;
    }
    // todo
    const ret = fn.body[8];
    if (ret instanceof RuleReturn && ret.expression instanceof RuleNormalCompletionRecordExpression) {
        const mul = ret.expression.value;
        if (mul instanceof RuleMultiplicativeExpression) {

            const left = extract(fn.body[0]);
            const right = extract(fn.body[2]);

            return types.builders.binaryExpression(mul.operator, left, right);
        }
    }
    return null;
}

function extract(p: any): Expression {
    return toNode(((p as RuleLetStatement).expression as RuleCallExpression).parameters[0]) as Expression;
}
