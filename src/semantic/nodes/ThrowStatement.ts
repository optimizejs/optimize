import {ThrowStatement} from 'estree';
import {throwCompletion} from '../CompletionRecords';
import {evaluate, readVariable} from '../rules/Basic';
import {returnIfAbrupt} from '../rules/Helper';
import {getValue} from '../rules/Others';
import {RuleFunction, RuleLetStatement, RuleReturn} from '../rules/RuleStatements';

export function ThrowStatement(node: ThrowStatement): RuleFunction {
    return new RuleFunction([], [
        new RuleLetStatement('exprRef', evaluate(node.argument)),
        new RuleLetStatement('exprValue', getValue(readVariable('exprRef'))),
        returnIfAbrupt('exprValue'),
        new RuleReturn(throwCompletion(readVariable('exprValue')))
    ]);
}
