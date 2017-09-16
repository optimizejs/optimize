import {Program, Statement} from 'estree';
import {types} from 'recast';
import {toNode, toRule} from '../../RuleMapper';
import {CompletionRecord} from '../CompletionRecords';
import {call, RuleCallExpression} from '../rules/Basic';
import {RuleExpression} from '../rules/RuleExpression';
import {RuleFunction, RuleLetStatement, RuleStatement} from '../rules/RuleStatements';

export function Program(node: Program): RuleExpression<CompletionRecord> {
    const statements: RuleStatement[] = [];
    for (const stmnt of node.body) { // TODO
        statements.push(new RuleLetStatement('sl', toRule(stmnt)));
    }

    return call(new RuleFunction([],
        statements
    ), []);
}

export function createProgram(rule: RuleExpression<CompletionRecord>): Program | null {
    if (!(rule instanceof RuleCallExpression) || rule.parameters.length !== 0) {
        return null;
    }
    const fn = rule.fn;

    const statements: Statement[] = [];

    for (const ruleStatement of fn.body) {
        if (ruleStatement instanceof RuleLetStatement && ruleStatement.variableName === 'sl') { // todo
            statements.push(toNode(ruleStatement.expression) as Statement);
        } else {
            return null;
        }
    }

    return types.builders.program(statements);
}
