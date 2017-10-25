import {SpreadElement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function SpreadElement(node: SpreadElement): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));
    return inNewScope([
            new RuleLetStatement('argument', argument)
        ],
        () => types.builders.spreadElement(argument.toExpression())
    ); // TODO
}
