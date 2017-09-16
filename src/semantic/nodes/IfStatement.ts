import {IfStatement} from 'estree';
import {toRule} from '../../RuleMapper';
import {CompletionRecord, normalCompletion} from '../CompletionRecords';
import {call, isSame, readVariable} from '../rules/Basic';
import {returnIfAbrupt} from '../rules/Helper';
import {getValue} from '../rules/Others';
import {RuleExpression} from '../rules/RuleExpression';
import {RuleFunction, RuleIfStatement, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';
import {constant} from '../values/PrimitiveValue';
import {EMPTY, isEmptyValue} from '../values/Value';

export function IfStatement(node: IfStatement): RuleExpression<CompletionRecord> {
    return call(new RuleFunction([], [
        new RuleLetStatement('exprRef', toRule(node.test)),
        new RuleLetStatement('exprValue', getValue(readVariable('exprRef'))),
        returnIfAbrupt('exprValue'),
        new RuleIfStatement(
            isSame(readVariable('exprValue'), constant(true)),
            new RuleLetStatement('stmtCompletion', toRule(node.consequent)),
            new RuleLetStatement('stmtCompletion', node.alternate ? toRule(node.alternate) : normalCompletion(EMPTY))
        ),
        returnIfAbrupt('stmtCompletion'),
        new RuleIfStatement(
            isEmptyValue(readVariable('stmtCompletion')),
            new RuleReturn(normalCompletion(constant(void 0))),
            new RuleReturn(readVariable('stmtCompletion'))
        )
    ]), []);
}
