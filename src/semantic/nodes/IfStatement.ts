import {IfStatement} from 'estree';
import {normalCompletion} from '../CompletionRecords';
import {evaluate, isSame, readVariable} from '../rules/Basic';
import {returnIfAbrupt} from '../rules/Helper';
import {getValue} from '../rules/Others';
import {RuleFunction, RuleIfStatement, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';
import {constant} from '../values/PrimitiveValue';
import {EMPTY, isEmptyValue} from '../values/Value';

export function IfStatement(node: IfStatement): RuleFunction {
    return new RuleFunction([], [
        new RuleLetStatement('exprRef', evaluate(node.test)),
        new RuleLetStatement('exprValue', getValue(readVariable('exprRef'))),
        returnIfAbrupt('exprValue'),
        new RuleIfStatement(
            isSame(readVariable('exprValue'), constant(true)),
            new RuleLetStatement('stmtCompletion', evaluate(node.consequent)),
            new RuleLetStatement('stmtCompletion', node.alternate ? evaluate(node.alternate) : normalCompletion(EMPTY))
        ),
        returnIfAbrupt('stmtCompletion'),
        new RuleIfStatement(
            isEmptyValue(readVariable('stmtCompletion')),
            new RuleReturn(normalCompletion(constant(void 0))),
            new RuleReturn(readVariable('stmtCompletion'))
        )
    ]);
}
