import {
    CompletionRecord,
    normalCompletion,
    NormalCompletionRecord,
    returnIfAbrupt,
    throwCompletion
} from '../domain/CompletionRecords';
import {getBindingValue} from '../domain/EnvironmentRecord';
import {getType, JSValue, toObject} from '../domain/js/JSValue';
import {callGet} from '../domain/js/ObjectValue';
import {isPrimitive, Prim, PrimExpr, PrimitiveValue} from '../domain/js/PrimitiveValue';
import {
    getBase,
    getReferencedName,
    getThisValue,
    isPropertyReference,
    isReference,
    isStrictReference,
    isUnresolvable
} from '../domain/Reference';
import {and, call, readVariable, same} from './Basic';
import {referenceError} from './BuiltIn';
import {RuleExpression} from './expression/RuleExpression';
import {calculableExpression, unknownExpression} from './expression/RuleParamExpression';
import {
    RuleBlockStatement,
    RuleEmptyStatement,
    RuleFunction,
    RuleIfStatement,
    RuleLetStatement,
    RuleReturn
} from './RuleStatements';

export const GET_VALUE = new RuleFunction(['V'], [
    returnIfAbrupt('V'),
    new RuleIfStatement(
        isReference(readVariable('V')),
        new RuleBlockStatement([
            new RuleLetStatement('base', getBase(readVariable('V'))),
            new RuleIfStatement(
                isUnresolvable(readVariable('V')),
                new RuleReturn(throwCompletion(referenceError())),
                new RuleEmptyStatement()
            ),
            new RuleIfStatement(
                isPropertyReference(readVariable('V')),
                new RuleBlockStatement([
                    new RuleIfStatement(
                        isPrimitive(readVariable('base')),
                        new RuleLetStatement('base', toObject(readVariable('base'))),
                        new RuleEmptyStatement()
                    ),
                    new RuleReturn(callGet(
                        readVariable('base'),
                        getReferencedName(readVariable('V')),
                        getThisValue(readVariable('V'))
                    ))
                ]),
                new RuleReturn(getBindingValue(
                    readVariable('base'),
                    getReferencedName(readVariable('V')),
                    isStrictReference(readVariable('V'))
                ))
            )
        ]),
        new RuleReturn(normalCompletion(readVariable('V')))
    )
]);

export function getValue(cr: RuleExpression<CompletionRecord>): RuleExpression<CompletionRecord> {
    return call(GET_VALUE, [cr]);
}

function strictComparison(x: JSValue, y: JSValue): boolean {
    if (x.getType() !== y.getType()) {
        return false;
    }
    if (x instanceof PrimitiveValue) {
        return x.value === (y as PrimitiveValue).value;
    }
    throw new Error('Object values are not supported');
}

function primitiveEqualityComparison(left: PrimExpr, right: PrimExpr): RuleExpression<Prim> {

    return calculableExpression((l, r) => {
        /* tslint:disable-next-line */
        return new PrimitiveValue(l.value == r.value);
    }, left, right);
}

export function strictEquals(x: RuleExpression<JSValue>, y: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return calculableExpression<CompletionRecord, JSValue, JSValue>((l, r) => {
        return new NormalCompletionRecord(new PrimitiveValue(strictComparison(l, r)));
    }, x, y);
}

const EQUALITY_COMPARISON = new RuleFunction(['x', 'y'], [
    new RuleIfStatement(
        same(getType(readVariable('x')), getType(readVariable('y'))),
        new RuleReturn(strictEquals(readVariable('x'), readVariable('y'))),
        new RuleIfStatement(
            and(isPrimitive(readVariable('x')), isPrimitive(readVariable('y'))),
            new RuleReturn(normalCompletion(primitiveEqualityComparison(readVariable('x'), readVariable('y')))),
            new RuleReturn(unknownExpression(
                readVariable('x'),
                readVariable('y')
            ))
        )
    )
]);

export function equals(x: RuleExpression<JSValue>, y: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return call(EQUALITY_COMPARISON, [x, y]);
}
