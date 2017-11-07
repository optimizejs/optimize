import {MemberExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function MemberExpression(node: MemberExpression): RuleExpression<CompletionRecord> {
    const object = trackOptimized(toRule(node.object));
    const property = trackOptimized(toRule(node.property));

    return inNewScope([
        new RuleLetStatement('object', getValue(object)),
        new RuleLetStatement('property', getValue(property))
    ], () => types.builders.memberExpression(object.toExpression(), property.toExpression(), node.computed)); // TODO
}
