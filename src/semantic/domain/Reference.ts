import {RuleExpression, RuleUnaryExpression} from '../rules/RuleExpression';
import {JSValue} from './js/JSValue';
import {ObjectValue} from './js/ObjectValue';

export class Reference {
    reference: true;
}

export function isReference(value: RuleExpression<any>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, arg => arg instanceof Reference);
}

export function getBase(value: RuleExpression<Reference>): RuleExpression<JSValue> {
    return new RuleUnaryExpression(value, () => {
        throw new Error('Not implemented!');
    });
}

export function isUnresolvable(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, () => {
        throw new Error('Not implemented!');
    });
}

export function isPropertyReference(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, () => {
        throw new Error('Not implemented!');
    });
}

export function getReferencedName(value: RuleExpression<Reference>): RuleExpression<string> {
    return new RuleUnaryExpression(value, () => {
        throw new Error('Not implemented!');
    });
}

export function isStrictReference(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, () => {
        throw new Error('Not implemented!');
    });
}

export function getThisValue(value: RuleExpression<Reference>): RuleExpression<ObjectValue> {
    return new RuleUnaryExpression(value, () => {
        throw new Error('Not implemented!');
    });
}
