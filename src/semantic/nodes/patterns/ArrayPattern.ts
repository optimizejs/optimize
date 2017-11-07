import {ArrayPattern} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ArrayPattern(node: ArrayPattern): RuleExpression<CompletionRecord> {

    const elements = node.elements.map(el => trackOptimized(toRule(el)));
    return inNewScope(
        elements.map(el => new RuleLetStatement('el', el)),
        () => types.builders.arrayPattern(elements.map(el => el.toNode()))
    ); // TODO
}
