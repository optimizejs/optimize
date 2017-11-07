import {IfStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {
    CompletionRecord,
    EMPTY_COMPLETION,
    isEmptyValue,
    normalCompletion,
    returnIfAbrupt
} from '../../domain/CompletionRecords';
import {is, PrimitiveValue} from '../../domain/js/PrimitiveValue';
import {readVariable} from '../../rules/Basic';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {constant} from '../../rules/expression/RuleNoVarExpresion';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleIfStatement, RuleLetStatement, RuleReturn} from '../../rules/RuleStatements';

export function IfStatement(node: IfStatement): RuleExpression<CompletionRecord> {
    const test = trackOptimized(toRule(node.test));
    const consequent = trackOptimized(toRule(node.consequent));
    const alternate = node.alternate ? trackOptimized(toRule(node.alternate)) : null;
    return inNewScope([
        new RuleLetStatement('exprValue', getValue(test)),
        returnIfAbrupt('exprValue'),
        new RuleIfStatement(
            is(readVariable('exprValue'), true),
            new RuleLetStatement('stmtCompletion', consequent),
            new RuleLetStatement('stmtCompletion', alternate ? alternate : EMPTY_COMPLETION)
        ),
        returnIfAbrupt('stmtCompletion'),
        new RuleIfStatement(
            isEmptyValue(readVariable('stmtCompletion')),
            new RuleReturn(normalCompletion(constant(new PrimitiveValue(void 0)))),
            new RuleReturn(readVariable('stmtCompletion'))
        )
    ], () => types.builders.ifStatement(
        test.toExpression(),
        consequent.toStatement(),
        alternate ? alternate.toStatement() : null
    ));
}
