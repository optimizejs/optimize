import {ObjectExpression, Property} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {getValue} from '../../rules/Others';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ObjectExpression(node: ObjectExpression): RuleExpression<CompletionRecord> {
    const properties = node.properties.map(property => trackOptimized(toRule(property)));
    return inNewScope([
        ...properties.map(arg => new RuleLetStatement('prop', getValue(arg)))
    ], () => types.builders.objectExpression(properties.map(element => element.toNode()))); // TODO
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
