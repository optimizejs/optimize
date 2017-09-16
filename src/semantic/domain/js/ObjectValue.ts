import {unknown} from '../../rules/Helper';
import {RuleExpression} from '../../rules/RuleExpression';
import {CompletionRecord} from '../CompletionRecords';
import {JSValue} from './JSValue';

export class ObjectValue extends JSValue {
    objectValue: true;
}

export function callGet(obj: RuleExpression<ObjectValue>, property: RuleExpression<string>,
                        thisValue: RuleExpression<ObjectValue>): RuleExpression<CompletionRecord> {

    return unknown();
}
