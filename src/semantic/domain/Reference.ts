import {RuleExpression} from '../rules/expression/RuleExpression';
import {notImplementedCalculator, RuleParamExpression} from '../rules/expression/RuleParamExpression';
import {JSValue} from './js/JSValue';
import {ObjectValue} from './js/ObjectValue';

export class Reference {
    reference: true;
}

export function isReference(value: RuleExpression<any>): RuleExpression<boolean> {
    return new RuleParamExpression(arg => arg instanceof Reference, value);
}

export function getBase(value: RuleExpression<Reference>): RuleExpression<JSValue> {
    return new RuleParamExpression(notImplementedCalculator, value);
}

export function isUnresolvable(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleParamExpression(notImplementedCalculator, value);
}

export function isPropertyReference(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleParamExpression(notImplementedCalculator, value);
}

export function getReferencedName(value: RuleExpression<Reference>): RuleExpression<string> {
    return new RuleParamExpression(notImplementedCalculator, value);
}

export function isStrictReference(value: RuleExpression<Reference>): RuleExpression<boolean> {
    return new RuleParamExpression(notImplementedCalculator, value);
}

export function getThisValue(value: RuleExpression<Reference>): RuleExpression<ObjectValue> {
    return new RuleParamExpression(notImplementedCalculator, value);
}
