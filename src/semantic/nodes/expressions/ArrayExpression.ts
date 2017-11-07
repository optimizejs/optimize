import {ArrayExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ArrayExpression(node: ArrayExpression): RuleExpression<CompletionRecord> {
    const elements = node.elements.map(element => trackOptimized(toRule(element)));
    return inNewScope([
        ...elements.map(arg => new RuleLetStatement('elem', getValue(arg)))
    ], () => types.builders.arrayExpression(elements.map(element => element.toExpression()))); // TODO
}
