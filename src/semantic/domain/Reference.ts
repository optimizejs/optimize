import {unknown} from '../rules/Helper';
import {RuleExpression} from '../rules/RuleExpression';
import {JSValue} from './js/JSValue';
import {ObjectValue} from './js/ObjectValue';

export class Reference {
    reference: true;
}

export function isReference(value: RuleExpression<any>): RuleExpression<boolean> {
    return unknown();
}

export function getBase(value: RuleExpression<Reference>): RuleExpression<JSValue> {
    return unknown();
}

export function isUnresolvable(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return unknown();
}

export function isPropertyReference(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return unknown();
}

export function getReferencedName(value: RuleExpression<Reference>): RuleExpression<string> {
    return unknown();
}

export function isStrictReference(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return unknown();
}

export function getThisValue(value: RuleExpression<Reference>): RuleExpression<ObjectValue> {
    return unknown();
}
