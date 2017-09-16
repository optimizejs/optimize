import {ThrowStatement} from 'estree';
import {toRule} from '../../RuleMapper';
import {CompletionRecord, returnIfAbrupt, throwCompletion} from '../domain/CompletionRecords';
import {call, readVariable} from '../rules/Basic';
import {getValue} from '../rules/Others';
import {RuleExpression} from '../rules/RuleExpression';
import {RuleFunction, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';

export function ThrowStatement(node: ThrowStatement): RuleExpression<CompletionRecord> {
    return call(new RuleFunction([], [
        new RuleLetStatement('exprRef', toRule(node.argument)),
        new RuleLetStatement('exprValue', getValue(readVariable('exprRef'))),
        returnIfAbrupt('exprValue'),
        new RuleReturn(throwCompletion(readVariable('exprValue')))
    ]), []);
}
