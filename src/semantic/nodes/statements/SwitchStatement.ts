import {SwitchCase, SwitchStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function SwitchStatement(node: SwitchStatement): RuleExpression<CompletionRecord> {
    const discriminant = trackOptimized(toRule(node.discriminant));
    const cases = node.cases.map(c => trackOptimized(toRule(c)));
    return inNewScope([
        new RuleLetStatement('discriminant', getValue(discriminant)),
        ...cases.map(c => new RuleLetStatement('c', c))
    ], () => types.builders.switchStatement(
        discriminant.toExpression(),
        cases.map(c => c.toNode())
    )); // TODO
}

export function SwitchCase(node: SwitchCase): RuleExpression<CompletionRecord> {
    const test = node.test ? trackOptimized(toRule(node.test)) : null;
    const statements = node.consequent.map(statement => trackOptimized(toRule(statement)));
    return inNewScope([
        ...test ? [new RuleLetStatement('test', getValue(test))] : [],
        ...statements.map(statement => new RuleLetStatement('s', statement))
    ], () => types.builders.switchCase(
        test && test.toExpression(),
        statements.map(s => s.toNode())
    )); // TODO
}
