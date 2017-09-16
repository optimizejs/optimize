import {CompletionRecord, normalCompletion, returnIfAbrupt, throwCompletion} from '../domain/CompletionRecords';
import {getBindingValue} from '../domain/EnvironmentRecord';
import {toObject} from '../domain/js/JSValue';
import {callGet} from '../domain/js/ObjectValue';
import {isPrimitive} from '../domain/js/PrimitiveValue';
import {
    getBase,
    getReferencedName,
    getThisValue,
    isPropertyReference,
    isReference,
    isStrictReference,
    isUnresolvable
} from '../domain/Reference';
import {call, readVariable} from './Basic';
import {referenceError} from './BuiltIn';
import {RuleExpression} from './RuleExpression';
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
