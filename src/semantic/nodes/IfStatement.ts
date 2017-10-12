import {IfStatement} from 'estree';
import {toRule} from '../../RuleMapper';
import {
    CompletionRecord,
    EMPTY_COMPLETION,
    isEmptyValue,
    normalCompletion,
    returnIfAbrupt
} from '../domain/CompletionRecords';
import {is, PrimitiveValue} from '../domain/js/PrimitiveValue';
import {readVariable} from '../rules/Basic';
import {getValue} from '../rules/Others';
import {constant, RuleExpression} from '../rules/RuleExpression';
import {inNewScope, RuleIfStatement, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';

export function IfStatement(node: IfStatement): RuleExpression<CompletionRecord> {
    return inNewScope([
        new RuleLetStatement('exprRef', toRule(node.test)),
        new RuleLetStatement('exprValue', getValue(readVariable('exprRef'))),
        returnIfAbrupt('exprValue'),
        new RuleIfStatement(
            is(readVariable('exprValue'), true),
            new RuleLetStatement('stmtCompletion', toRule(node.consequent)),
            new RuleLetStatement('stmtCompletion', node.alternate ? toRule(node.alternate) : EMPTY_COMPLETION)
        ),
        returnIfAbrupt('stmtCompletion'),
        new RuleIfStatement(
            isEmptyValue(readVariable('stmtCompletion')),
            new RuleReturn(normalCompletion(constant(new PrimitiveValue(void 0)))),
            new RuleReturn(readVariable('stmtCompletion'))
        )
    ]);
}
