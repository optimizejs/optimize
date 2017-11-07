import {ArrayPattern, AssignmentProperty, ObjectPattern} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ObjectPattern(node: ObjectPattern): RuleExpression<CompletionRecord> {

    const properties = node.properties.map(prop => trackOptimized(toRule(prop)));
    return inNewScope(
        properties.map(p => new RuleLetStatement('p', p)),
        () => types.builders.objectPattern(properties.map(p => p.toNode()))
    ); // TODO
}
