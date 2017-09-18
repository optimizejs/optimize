import {Expression, Node, Program as IProgram, Statement} from 'estree';
import {CompletionRecord} from './semantic/domain/CompletionRecords';
import {BinaryExpression, createBinaryExpression} from './semantic/nodes/BinaryExpression';
import {createExpressionStatement, ExpressionStatement} from './semantic/nodes/ExpressionStatement';
import {IfStatement} from './semantic/nodes/IfStatement';
import {createLiteral, Literal} from './semantic/nodes/Literal';
import {createProgram, Program} from './semantic/nodes/Program';
import {ThrowStatement} from './semantic/nodes/ThrowStatement';
import {RuleExpression} from './semantic/rules/RuleExpression';

type RuleMapping = (node: Node) => RuleExpression<CompletionRecord>;

type BackMapper<T extends Node> = (rule: RuleExpression<CompletionRecord>) => T | null;

const ruleMap: { [type: string]: RuleMapping } = {
    BinaryExpression,
    ExpressionStatement,
    IfStatement,
    Literal,
    Program,
    ThrowStatement
};

const expressionMap: BackMapper<Expression>[] = [
    createBinaryExpression,
    createLiteral
];

const statementMap: BackMapper<Statement>[] = [
    createExpressionStatement
];

const programMap: BackMapper<IProgram>[] = [
    createProgram
];

export function toRule(node: Node): RuleExpression<CompletionRecord> {
    return ruleMap[node.type](node);
}

export function toExpression(rule: RuleExpression<CompletionRecord>): Expression {
    return toNode(rule, expressionMap);
}

export function toStatement(rule: RuleExpression<CompletionRecord>): Statement {
    return toNode(rule, statementMap);
}

export function toProgram(rule: RuleExpression<CompletionRecord>): IProgram {
    return toNode(rule, programMap);
}

function toNode<T extends Node>(rule: RuleExpression<CompletionRecord>, map: BackMapper<T>[]): T {
    for (const mapper of map) {
        const result = mapper(rule);
        if (result !== null) {
            return result;
        }
    }
    throw new Error('No mapping found!');
}
