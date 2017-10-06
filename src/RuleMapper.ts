import {Expression, Node, Program as IProgram, Statement} from 'estree';
import {CompletionRecord} from './semantic/domain/CompletionRecords';
import {BinaryExpression} from './semantic/nodes/BinaryExpression';
import {createExpressionStatement, ExpressionStatement} from './semantic/nodes/ExpressionStatement';
import {IfStatement} from './semantic/nodes/IfStatement';
import {createLiteral, Literal} from './semantic/nodes/Literal';
import {LogicalExpression} from './semantic/nodes/LogicalExpression';
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
    LogicalExpression,
    Program,
    ThrowStatement
};

const expressionMap: BackMapper<Expression>[] = [
    createLiteral
];

const statementMap: BackMapper<Statement>[] = [
    createExpressionStatement
];

const programMap: BackMapper<IProgram>[] = [
    createProgram
];

export function toRule(node: Node): RuleExpression<CompletionRecord> {
    const result = ruleMap[node.type](node);
    result.original = node;
    return result;
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
    if (rule.mapper) {
        return rule.mapper() as T;
    }

    for (const mapper of map) {
        const result = mapper(rule);
        if (result !== null) {
            if (rule.original) {
                if (rule.original.type === result.type) {
                    const copy: T = clone(rule.original) as T;
                    const keys = Object.keys(result) as (keyof T)[];
                    for (const key of keys) {
                        copy[key] = result[key];
                    }
                    return copy;
                }
            }
            return result;
        }
    }
    throw new Error('No mapping found!');
}

function clone<T>(obj: T): T {
    const result = Object.create(Object.getPrototypeOf(obj));
    for (const key of Object.getOwnPropertyNames(obj)) {
        Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(obj, key));
    }
    return result;
}
