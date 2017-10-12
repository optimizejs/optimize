import {TaggedTemplateExpression, TemplateLiteral} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function TemplateLiteral(node: TemplateLiteral): RuleExpression<CompletionRecord> {
    const expressions = node.expressions.map(param => trackOptimized(toRule(param)));

    return inNewScope(
        expressions.map(e => new RuleLetStatement('e', e)),
        () => types.builders.templateLiteral(node.quasis, expressions.map(e => e.toExpression()))
    ); // TODO
}

export function TaggedTemplateExpression(node: TaggedTemplateExpression): RuleExpression<CompletionRecord> {
    const tag = trackOptimized(toRule(node.tag));
    const quasi = trackOptimized(toRule(node.quasi));

    return inNewScope([
            new RuleLetStatement('tag', tag),
            new RuleLetStatement('quasi', quasi)
        ],
        () => types.builders.taggedTemplateExpression(tag.toExpression(), quasi.toNode())
    ); // TODO
}
