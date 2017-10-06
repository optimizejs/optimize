import {BinaryExpression, Expression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../domain/CompletionRecords';
import {getType, Type} from '../domain/js/JSValue';
import {Prim, PrimExpr, PrimitiveValue} from '../domain/js/PrimitiveValue';
import {call, constant, or, readVariable, same} from '../rules/Basic';
import {toNumber, toPrimitive, toString} from '../rules/BuiltIn';
import {equals, getValue, strictEquals} from '../rules/Others';
import {
    BinaryCalculator,
    RuleBinaryExpression,
    RuleExpression,
    RuleUnaryExpression,
    SimpleUnaryCalculator,
    trackOptimized,
    TrackOptimizedExpression
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

class ParamValues {
    readonly statements: RuleStatement[];
    private leftRule: TrackOptimizedExpression;
    private rightRule: TrackOptimizedExpression;

    constructor(node: BinaryExpression) {
        this.leftRule = trackOptimized(toRule(node.left));
        this.rightRule = trackOptimized(toRule(node.right));
        this.statements = [
            new RuleLetStatement('leftValue', getValue(this.leftRule)),
            returnIfAbrupt('leftValue'),
            new RuleLetStatement('rightValue', getValue(this.rightRule)),
            returnIfAbrupt('rightValue')
        ];
    }

    left(): Expression {
        return this.leftRule.toNode();
    }

    right(): Expression {
        return this.rightRule.toNode();
    }
}

function AdditionExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    const paramValues = new ParamValues(node);

    return call(new RuleFunction([], [
        ...paramValues.statements,
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
    ]), [], () => {
        return types.builders.binaryExpression('+', paramValues.left(), paramValues.right());
    });
}

function NumberBinaryExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    const paramValues = new ParamValues(node);
    return call(new RuleFunction([], [
        ...paramValues.statements,
        new RuleLetStatement('lnum', toNumber(readVariable('leftValue'))),
        returnIfAbrupt('lnum'),
        new RuleLetStatement('rnum', toNumber(readVariable('rightValue'))),
        returnIfAbrupt('rnum'),
        new RuleReturn(normalCompletion(jsBinary(
            node.operator,
            readVariable('lnum'),
            readVariable('rnum')
        )))
    ]), [], () => {
        return types.builders.binaryExpression(node.operator, paramValues.left(), paramValues.right());
    });
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

    const paramValues = new ParamValues(node);

    return call(new RuleFunction([], [
        ...paramValues.statements,
        new RuleReturn(result)
    ]), [], () => {
        return types.builders.binaryExpression(node.operator, paramValues.left(), paramValues.right());
    });
}
