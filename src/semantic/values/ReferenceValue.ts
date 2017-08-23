import {CompletionRecord} from '../CompletionRecords';
import {unknown} from '../rules/Helper';
import {RuleExpression} from '../rules/RuleExpression';
import {Value} from './Value';

export class ReferenceValue extends Value {

}

export function getBase(value: RuleExpression<ReferenceValue>): RuleExpression<Value> {
    return unknown();
}

export function isUnresolvable(value: RuleExpression<ReferenceValue>): RuleExpression<boolean> {
    return unknown();
}

export function isPropertyReference(value: RuleExpression<ReferenceValue>): RuleExpression<boolean> {
    return unknown();
}

export function getReferencedName(value: RuleExpression<ReferenceValue>): RuleExpression<string> {
    return unknown();
}

export function isStrictReference(value: RuleExpression<ReferenceValue>): RuleExpression<boolean> {
    return unknown();
}

export function getThisValue(value: RuleExpression<ReferenceValue>): RuleExpression<ReferenceValue> {
    return unknown();
}

export function callGet(obj: RuleExpression<ReferenceValue>, property: RuleExpression<string>,
                        thisValue: RuleExpression<ReferenceValue>): RuleExpression<CompletionRecord> {

    return unknown();
}
