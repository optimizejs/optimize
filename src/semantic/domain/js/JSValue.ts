import {RuleExpression, RuleUnaryExpression} from '../../rules/RuleExpression';
import {ObjectValue} from './ObjectValue';

export class JSValue {
    jsValue: true;
}

export function toObject(value: RuleExpression<JSValue>): RuleExpression<ObjectValue> {
    return new RuleUnaryExpression(value, () => {
        throw new Error('Not implemented!');
    });
}
