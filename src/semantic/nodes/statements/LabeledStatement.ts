import {LabeledStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {getValue} from '../../rules/Others';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function LabeledStatement(node: LabeledStatement): RuleExpression<CompletionRecord> {
    const body = trackOptimized(toRule(node.body));
    return inNewScope([
        new RuleLetStatement('body', getValue(body))
    ], () => types.builders.labeledStatement(node.label, body.toStatement())); // TODO
}
