import {ArrayPattern, AssignmentProperty, ObjectPattern, Property} from 'estree';
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

export function Property(node: Property): RuleExpression<CompletionRecord> {
    const key = trackOptimized(toRule(node.key));
    const value = trackOptimized(toRule(node.value));
    return inNewScope([
        new RuleLetStatement('key', key),
        new RuleLetStatement('value', value)
    ], () => {
        const result = types.builders.property(
            node.kind,
            key.toExpression(),
            value.toExpression()
        );
        result.method = node.method;
        result.shorthand = node.shorthand;
        result.computed = node.computed;
        return result;
    }); // TODO
}
