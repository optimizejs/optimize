import {BinaryExpression, Expression} from 'estree';
import {types} from 'recast';
import {toExpression, toRule} from '../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../domain/CompletionRecords';
import {isType, Type} from '../domain/js/JSValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {call, or, readVariable, RuleCallExpression} from '../rules/Basic';
import {toNumber, toPrimitive, toString} from '../rules/BuiltIn';
import {getValue} from '../rules/Others';
import {RuleBinaryExpression, RuleExpression, RuleUnaryExpression} from '../rules/RuleExpression';
import {RuleBlockStatement, RuleFunction, RuleIfStatement, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';

export function BinaryExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    switch (node.operator) {
        case '*':
        case '/':
        case '%':
        case '-':
        case '>>':
        case '<<':
        case '>>>':
        case '|':
        case '&':
        case '^':
            return NumberBinaryExpression(node);
        case '+':
            return AdditionExpression(node);
        default:
            throw new Error('Unsupported operator: ' + node.operator);
    }
}

function jsEvaluator(operator: string): (l: PrimitiveValue, r: PrimitiveValue) => PrimitiveValue {
    const evaluator = new Function('a,b', 'return a ' + operator + ' b;') as (a: primitive, b: primitive) => primitive;
    return (lval: PrimitiveValue, rval: PrimitiveValue) => new PrimitiveValue(evaluator(lval.value, rval.value));
}

class RuleJsBinaryOperation extends RuleBinaryExpression<PrimitiveValue, PrimitiveValue, PrimitiveValue> {
    constructor(readonly operator: string, l: RuleExpression<PrimitiveValue>, r: RuleExpression<PrimitiveValue>) {
        super(l, r, jsEvaluator(operator));
    }
}

function AdditionExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    return call(new RuleFunction([], [
        new RuleLetStatement('leftValue', getValue(toRule(node.left))),
        returnIfAbrupt('leftValue'),
        new RuleLetStatement('rightValue', getValue(toRule(node.right))),
        returnIfAbrupt('rightValue'),
        new RuleLetStatement('lprim', toPrimitive(readVariable('leftValue'))),
        returnIfAbrupt('lprim'),
        new RuleLetStatement('rprim', toPrimitive(readVariable('rightValue'))),
        returnIfAbrupt('rprim'),
        new RuleIfStatement(
            or(isType(readVariable('lprim'), Type.STRING), isType(readVariable('rprim'), Type.STRING)),
            new RuleBlockStatement([
                new RuleLetStatement('lstr', toString(readVariable('lprim'))),
                returnIfAbrupt('lstr'),
                new RuleLetStatement('rstr', toString(readVariable('rprim'))),
                returnIfAbrupt('rstr'),
                new RuleReturn(normalCompletion(new RuleJsBinaryOperation(
                    '+',
                    readVariable('lstr'),
                    readVariable('rstr')
                )))
            ]),
            new RuleBlockStatement([
                new RuleLetStatement('lnum', toNumber(readVariable('lprim'))),
                returnIfAbrupt('lnum'),
                new RuleLetStatement('rnum', toNumber(readVariable('rprim'))),
                returnIfAbrupt('rnum'),
                new RuleReturn(normalCompletion(new RuleJsBinaryOperation(
                    '+',
                    readVariable('lnum'),
                    readVariable('rnum')
                )))
            ])
        )
    ]), []);
}

function NumberBinaryExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    return call(new RuleFunction([], [
        new RuleLetStatement('leftValue', getValue(toRule(node.left))),
        returnIfAbrupt('leftValue'),
        new RuleLetStatement('rightValue', getValue(toRule(node.right))),
        returnIfAbrupt('rightValue'),
        new RuleLetStatement('lnum', toNumber(readVariable('leftValue'))),
        returnIfAbrupt('lnum'),
        new RuleLetStatement('rnum', toNumber(readVariable('rightValue'))),
        returnIfAbrupt('rnum'),
        new RuleReturn(normalCompletion(new RuleJsBinaryOperation(
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
    if (ret instanceof RuleReturn && ret.expression instanceof RuleUnaryExpression) {
        const mul = ret.expression.argument;
        if (mul instanceof RuleJsBinaryOperation) {

            const left = extract(fn.body[0]);
            const right = extract(fn.body[2]);

            return types.builders.binaryExpression(mul.operator, left, right);
        }
    }
    return null;
}

function extract(p: any): Expression {
    return toExpression(((p as RuleLetStatement).expression as RuleCallExpression).parameters[0]);
}
