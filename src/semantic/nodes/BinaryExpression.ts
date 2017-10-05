import {BinaryExpression, Expression} from 'estree';
import {types} from 'recast';
import {toExpression, toRule} from '../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../domain/CompletionRecords';
import {getType, Type} from '../domain/js/JSValue';
import {Prim, PrimExpr, PrimitiveValue} from '../domain/js/PrimitiveValue';
import {call, constant, or, readVariable, RuleCallExpression, RuleConstantExpression, same} from '../rules/Basic';
import {toNumber, toPrimitive, toString} from '../rules/BuiltIn';
import {equals, getValue, strictEquals} from '../rules/Others';
import {
    BinaryCalculator,
    RuleBinaryExpression,
    RuleExpression,
    RuleUnaryExpression,
    SimpleUnaryCalculator
} from '../rules/RuleExpression';
import {
    RuleBlockStatement,
    RuleFunction,
    RuleIfStatement,
    RuleLetStatement,
    RuleReturn,
    RuleStatement
} from '../rules/RuleStatements';

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
        case '==':
        case '!=':
        case '===':
        case '!==':
            return EqualityExpression(node);
        default:
            throw new Error('Unsupported operator: ' + node.operator);
    }
}

class JSBinaryCalculator implements BinaryCalculator<PrimitiveValue, PrimitiveValue, PrimitiveValue> {
    private readonly evaluator: (a: primitive, b: primitive) => primitive;

    constructor(readonly operator: string) {
        this.evaluator = new Function('a,b', 'return a ' + operator + ' b;') as any;
    }

    calculate(left: PrimitiveValue, right: PrimitiveValue): PrimitiveValue {
        return new PrimitiveValue(this.evaluator(left.value, right.value));
    }
}

function jsBinary(operator: string, l: PrimExpr, r: PrimExpr): RuleBinaryExpression<Prim, Prim, Prim> {
    return new RuleBinaryExpression(l, r, new JSBinaryCalculator(operator));
}

function getParameterValues(node: BinaryExpression): RuleStatement[] {
    return [
        new RuleLetStatement('leftValue', getValue(toRule(node.left))),
        returnIfAbrupt('leftValue'),
        new RuleLetStatement('rightValue', getValue(toRule(node.right))),
        returnIfAbrupt('rightValue')
    ];
}

function AdditionExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    return call(new RuleFunction([], [
        ...getParameterValues(node),
        new RuleLetStatement('lprim', toPrimitive(readVariable('leftValue'))),
        returnIfAbrupt('lprim'),
        new RuleLetStatement('rprim', toPrimitive(readVariable('rightValue'))),
        returnIfAbrupt('rprim'),
        new RuleIfStatement(
            or(
                same(getType(readVariable('lprim')), constant(Type.STRING)),
                same(getType(readVariable('rprim')), constant(Type.STRING))
            ),
            new RuleBlockStatement([
                new RuleLetStatement('lstr', toString(readVariable('lprim'))),
                returnIfAbrupt('lstr'),
                new RuleLetStatement('rstr', toString(readVariable('rprim'))),
                returnIfAbrupt('rstr'),
                new RuleReturn(normalCompletion(jsBinary(
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
                new RuleReturn(normalCompletion(jsBinary(
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
        ...getParameterValues(node),
        new RuleLetStatement('lnum', toNumber(readVariable('leftValue'))),
        returnIfAbrupt('lnum'),
        new RuleLetStatement('rnum', toNumber(readVariable('rightValue'))),
        returnIfAbrupt('rnum'),
        new RuleReturn(normalCompletion(jsBinary(
            node.operator,
            readVariable('lnum'),
            readVariable('rnum')
        )))
    ]), []);
}

function negate(expression: RuleExpression<CompletionRecord>): RuleExpression<CompletionRecord> {
    return call(new RuleFunction(['param'], [
        returnIfAbrupt('param'),
        new RuleReturn(normalCompletion(
            new RuleUnaryExpression(
                readVariable('param'),
                new SimpleUnaryCalculator(p => new PrimitiveValue(!(p as PrimitiveValue).value))
            )
        ))
    ]), [expression]);
}

function EqualityExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    const eq = node.operator.length === 3 ? strictEquals : equals;
    const eqResult = eq(readVariable('leftValue'), readVariable('rightValue'));
    const result = node.operator[0] === '!' ? negate(eqResult) : eqResult;

    return call(new RuleFunction([], [
        ...getParameterValues(node),
        new RuleReturn(result)
    ]), []);
}

export function createBinaryExpression(rule: RuleExpression<CompletionRecord>): BinaryExpression | null {
    if (!(rule instanceof RuleCallExpression) || rule.parameters.length !== 0) {
        return null;
    }
    const fn = rule.fn;

    if (fn.body.length === 5) {
        const ret = fn.body[4];
        if (ret instanceof RuleReturn) {
            let expression = ret.expression;

            let negated = false;
            if (expression instanceof RuleCallExpression && expression.fn.body.length === 2) {
                negated = true;
                expression = expression.parameters[0];
            }

            let operator;
            if (expression instanceof RuleCallExpression) {
                operator = '==';
            } else {
                operator = '===';
            }
            if (negated) {
                operator = '!' + operator.substring(1);
            }
            return types.builders.binaryExpression(operator, extract(fn.body[0]), extract(fn.body[2]));
        }
    }

    if (fn.body.length === 9) {
        const ret = fn.body[8];
        if (ret instanceof RuleReturn && ret.expression instanceof RuleUnaryExpression) {
            const mul = ret.expression.argument;
            if (mul instanceof RuleBinaryExpression && mul.calculator instanceof JSBinaryCalculator) {

                const left = extract(fn.body[0]);
                const right = extract(fn.body[2]);

                return types.builders.binaryExpression(mul.calculator.operator, left, right);
            }
        } else if (ret instanceof RuleIfStatement) { // + operator
            return types.builders.binaryExpression('+', extract(fn.body[0]), extract(fn.body[2]));
        }
    }
    return null;
}

function extract(p: any): Expression {
    const expression = (p as RuleLetStatement).expression;
    if (expression instanceof RuleConstantExpression) {
        return toExpression(expression);
    } else {
        return toExpression((expression as RuleCallExpression).parameters[0]);
    }
}
