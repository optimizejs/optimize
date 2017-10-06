type literalable = boolean | string | number | null;

type primitive = literalable | void | symbol;

declare module 'recast' {
    import {
        BinaryExpression,
        Expression,
        ExpressionStatement,
        Literal,
        LogicalExpression,
        Node,
        Program,
        Statement
    } from 'estree';

    interface PrintResult {
        code: string;
    }

    interface Options {
        lineTerminator: string;
    }

    interface Builders {
        binaryExpression(operator: string, left: Expression, right: Expression): BinaryExpression;

        expressionStatement(expression: Expression): ExpressionStatement;

        literal(value: primitive | RegExp): Literal;

        logicalExpression(operator: string, left: Expression, right: Expression): LogicalExpression;

        program(statements: Statement[]): Program;

    }

    export function parse(code: string): { program: Node };

    export function print(node: Node, options?: Options): PrintResult;

    export const types: { builders: Builders };
}
