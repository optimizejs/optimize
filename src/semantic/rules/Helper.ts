import {RuleExpression} from './RuleExpression';

export function unknown<T>(): RuleExpression<T> {
    return null as any; // TODO
}
