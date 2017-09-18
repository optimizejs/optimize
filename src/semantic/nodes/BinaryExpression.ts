import {BinaryExpression, Expression} from 'estree';
import {types} from 'recast';
import {toExpression, toRule} from '../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../domain/CompletionRecords';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {call, constant, readVariable, RuleCallExpression, RuleConstantExpression} from '../rules/Basic';
import {toNumber} from '../rules/BuiltIn';
import {Evaluation} from '../rules/Evaluation';
import {Optimized} from '../rules/Optimized';
import {getValue} from '../rules/Others';
import {RuleExpression, RuleUnaryExpression} from '../rules/RuleExpression';
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
    private evaluator: (a: number, b: number) => number;

    constructor(readonly operator: string, readonly left: RuleExpression<PrimitiveValue>,
                readonly right: RuleExpression<PrimitiveValue>) {
        // todo cache
        this.evaluator = new Function('a,b', 'return a ' + operator + ' b;') as (a: number, b: number) => number;
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<PrimitiveValue>> {
        const optimizedLeft = this.left.execute(evaluation);
        const optimizedRight = this.right.execute(evaluation);

        const left = optimizedLeft.get();
        const right = optimizedRight.get();

        if (left instanceof RuleConstantExpression && right instanceof RuleConstantExpression) {
            const lVal = (left.value as PrimitiveValue).value as number;
            const rVal = (right.value as PrimitiveValue).value as number;
            return Optimized.optimized(constant(new PrimitiveValue(this.evaluator(lVal, rVal))));
        }
        return Optimized.wrapIfOptimized(
            [optimizedLeft, optimizedRight],
            this,
            () => new RuleMultiplicativeExpression(this.operator, left, right)
        );
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
    if (ret instanceof RuleReturn && ret.expression instanceof RuleUnaryExpression) {
        const mul = ret.expression.argument;
        if (mul instanceof RuleMultiplicativeExpression) {

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
