import {unknown} from '../rules/Helper';
import {RuleExpression} from '../rules/RuleExpression';
import {CompletionRecord} from './CompletionRecords';

export abstract class EnvironmentRecord {
    env: true;
}

export function getBindingValue(er: RuleExpression<EnvironmentRecord>, name: RuleExpression<string>,
                                isStrict: RuleExpression<boolean>): RuleExpression<CompletionRecord> {

    return unknown();
}
