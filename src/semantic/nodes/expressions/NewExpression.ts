import {NewExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function NewExpression(node: NewExpression): RuleExpression<CompletionRecord> {
    const callee = trackOptimized(toRule(node.callee));
    const args = node.arguments.map(arg => trackOptimized(toRule(arg)));
    return inNewScope([
        new RuleLetStatement('func', getValue(callee)),
        ...args.map(arg => new RuleLetStatement('arg', getValue(arg)))
    ], () => types.builders.newExpression(callee.toExpression(), args.map(arg => arg.toExpression()))); // TODO
}
