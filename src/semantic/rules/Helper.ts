import {RuleExpression} from './expression/RuleExpression';

export function unknown<T>(): RuleExpression<T> {
    return null as any; // TODO
}
