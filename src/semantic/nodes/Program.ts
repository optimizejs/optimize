import {Program, Statement} from 'estree';
import {types} from 'recast';
import {toNode, toRule} from '../../RuleMapper';
import {call, RuleCallExpression} from '../rules/Basic';
import {RuleFunction, RuleLetStatement, RuleStatement} from '../rules/RuleStatements';

export function Program(node: Program): RuleFunction {
    const statements: RuleStatement[] = [];
    for (const stmnt of node.body) { // TODO
        statements.push(new RuleLetStatement('sl', call(toRule(stmnt), [])));
    }

    return new RuleFunction([],
        statements
    );
}

export function createProgram(rule: RuleFunction): Program | null {
    const statements: Statement[] = [];

    for (const ruleStatement of rule.body) {
        if (ruleStatement instanceof RuleLetStatement && ruleStatement.expression instanceof RuleCallExpression) {
            statements.push(toNode(ruleStatement.expression.fn) as Statement);
        } else {
            return null;
        }
    }

    return types.builders.program(statements);
}
