import {BinaryExpression, Expression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {
    CompletionRecord,
    normalCompletion,
    NormalCompletionRecord,
    returnIfAbrupt
} from '../../domain/CompletionRecords';
import {getType, Type} from '../../domain/js/JSValue';
import {Prim, PrimExpr, PrimitiveValue} from '../../domain/js/PrimitiveValue';
import {and, call, or, readVariable, same} from '../../rules/Basic';
import {toNumber, toPrimitive, toString} from '../../rules/BuiltIn';
import {RuleExpression, trackOptimized, TrackOptimizedExpression} from '../../rules/expression/RuleExpression';
import {constant} from '../../rules/expression/RuleNoVarExpresion';
import {Calculator, RuleParamExpression, SimpleCalculator} from '../../rules/expression/RuleParamExpression';
import {equals, getValue, strictEquals} from '../../rules/Others';
import {
    inNewScope,
    RuleBlockStatement,
    RuleFunction,
    RuleIfStatement,
    RuleLetStatement,
    RuleReturn,
    RuleStatement
} from '../../rules/RuleStatements';

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
        case '<':
        case '>':
        case '<=':
        case '>=':
            return RelationalExpression(node);
        default:
            return UnsupportedBinaryExpression(node);
    }
}

class JSBinaryCalculator implements Calculator<PrimitiveValue, PrimitiveValue, PrimitiveValue> {
    private readonly evaluator: (a: primitive, b: primitive) => primitive;

    constructor(readonly operator: string) {
        this.evaluator = new Function('a,b', 'return a ' + operator + ' b;') as any;
    }

    calculate(left: PrimitiveValue, right: PrimitiveValue): PrimitiveValue {
        return new PrimitiveValue(this.evaluator(left.value, right.value));
    }
}

function jsBinary(operator: string, l: PrimExpr, r: PrimExpr): RuleParamExpression<Prim, Prim, Prim> {
    return new RuleParamExpression(new JSBinaryCalculator(operator), l, r);
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
        return this.leftRule.toExpression();
    }

    right(): Expression {
        return this.rightRule.toExpression();
    }
}

function AdditionExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    const paramValues = new ParamValues(node);

    return inNewScope([
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
    ], () => {
        return types.builders.binaryExpression('+', paramValues.left(), paramValues.right());
    });
}

function NumberBinaryExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    const paramValues = new ParamValues(node);
    return inNewScope([
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
    ], () => {
        return types.builders.binaryExpression(node.operator, paramValues.left(), paramValues.right());
    });
}

function negate(expression: RuleExpression<CompletionRecord>): RuleExpression<CompletionRecord> {
    return call(new RuleFunction(['param'], [
        returnIfAbrupt('param'),
        new RuleReturn(normalCompletion(
            new RuleParamExpression(
                new SimpleCalculator(p => new PrimitiveValue(!(p as PrimitiveValue).value)), // todo duplicate
                readVariable('param'),
            )
        ))
    ]), [expression]);
}

function EqualityExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    const eq = node.operator.length === 3 ? strictEquals : equals;
    const eqResult = eq(readVariable('leftValue'), readVariable('rightValue'));
    const result = node.operator[0] === '!' ? negate(eqResult) : eqResult;

    const paramValues = new ParamValues(node);

    return inNewScope([
        ...paramValues.statements,
        new RuleReturn(result)
    ], () => {
        return types.builders.binaryExpression(node.operator, paramValues.left(), paramValues.right());
    });
}

const relationalOperators: { [op: string]: (a: primitive, b: primitive) => boolean } = {};

for (const operator of ['<', '>', '<=', '>=']) {
    relationalOperators[operator] = new Function('a,b', 'return a' + operator + 'b;') as any;
}

function RelationalExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    const paramValues = new ParamValues(node);

    const calculator = new SimpleCalculator((l: PrimitiveValue, r: PrimitiveValue) => {
        return new NormalCompletionRecord(new PrimitiveValue(relationalOperators[node.operator](l.value, r.value)));
    });

    return inNewScope([
        ...paramValues.statements,
        new RuleLetStatement('lp', toPrimitive(readVariable('leftValue'))),
        returnIfAbrupt('lp'),
        new RuleLetStatement('rp', toPrimitive(readVariable('rightValue'))),
        returnIfAbrupt('rp'),
        new RuleIfStatement(
            and(
                same(getType(readVariable('lp')), constant(Type.STRING)),
                same(getType(readVariable('rp')), constant(Type.STRING))
            ),
            new RuleReturn(new RuleParamExpression(
                calculator,
                readVariable('lp'),
                readVariable('rp')
            )),
            new RuleBlockStatement([
                new RuleLetStatement('ln', toNumber(readVariable('lp'))),
                returnIfAbrupt('ln'),
                new RuleLetStatement('rn', toNumber(readVariable('rp'))),
                returnIfAbrupt('rn'),
                new RuleReturn(new RuleParamExpression(
                    calculator,
                    readVariable('ln'),
                    readVariable('rn'),
                ))
            ])
        )
    ], () => {
        return types.builders.binaryExpression(node.operator, paramValues.left(), paramValues.right());
    });
}

function UnsupportedBinaryExpression(node: BinaryExpression): RuleExpression<CompletionRecord> {
    const left = trackOptimized(toRule(node.left));
    const right = trackOptimized(toRule(node.right));
    return inNewScope([
        new RuleLetStatement('left', left),
        new RuleLetStatement('right', right)
    ], () => {
        return types.builders.binaryExpression(node.operator, left.toExpression(), right.toExpression());
    });
}
