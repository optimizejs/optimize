import {unknown} from '../../rules/Helper';
import {RuleExpression} from '../../rules/RuleExpression';
import {ObjectValue} from './ObjectValue';

export class JSValue {
    jsValue: true;
}

export function toObject(value: RuleExpression<JSValue>): RuleExpression<ObjectValue> {
    return unknown();
}
