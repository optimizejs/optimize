import {RuleExpression} from '../rules/expression/RuleExpression';
import {unknownExpression} from '../rules/expression/RuleParamExpression';
import {CompletionRecord} from './CompletionRecords';

export abstract class EnvironmentRecord {
    env: true;
}

export function getBindingValue(er: RuleExpression<EnvironmentRecord>, name: RuleExpression<string>,
                                isStrict: RuleExpression<boolean>): RuleExpression<CompletionRecord> {

    return unknownExpression(er, name, isStrict);
}
