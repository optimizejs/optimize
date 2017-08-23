import {getNormalValue, isAbrupt} from '../CompletionRecords';
import {readVariable} from './Basic';
import {RuleExpression} from './RuleExpression';
import {RuleIfStatement, RuleLetStatement, RuleReturn, RuleStatement} from './RuleStatements';

export function unknown<T>(): RuleExpression<T> {
    return null as any; // TODO
}

export function returnIfAbrupt(variableName: string): RuleStatement {
    return new RuleIfStatement(
        isAbrupt(readVariable(variableName)),
        new RuleReturn(readVariable(variableName)),
        new RuleLetStatement(variableName, getNormalValue(readVariable(variableName)))
    );
}
