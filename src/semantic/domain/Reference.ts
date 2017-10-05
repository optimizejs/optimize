import {
    notImplementedUnaryCalculator,
    RuleExpression,
    RuleUnaryExpression,
    SimpleUnaryCalculator
} from '../rules/RuleExpression';
import {JSValue} from './js/JSValue';
import {ObjectValue} from './js/ObjectValue';

export class Reference {
    reference: true;
}

export function isReference(value: RuleExpression<any>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, new SimpleUnaryCalculator(arg => arg instanceof Reference));
}

export function getBase(value: RuleExpression<Reference>): RuleExpression<JSValue> {
    return new RuleUnaryExpression(value, notImplementedUnaryCalculator);
}

export function isUnresolvable(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, notImplementedUnaryCalculator);
}

export function isPropertyReference(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, notImplementedUnaryCalculator);
}

export function getReferencedName(value: RuleExpression<Reference>): RuleExpression<string> {
    return new RuleUnaryExpression(value, notImplementedUnaryCalculator);
}

export function isStrictReference(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, notImplementedUnaryCalculator);
}

export function getThisValue(value: RuleExpression<Reference>): RuleExpression<ObjectValue> {
    return new RuleUnaryExpression(value, notImplementedUnaryCalculator);
}
