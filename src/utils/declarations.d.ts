type literalable = boolean | string | number | null;

type primitive = literalable | void | symbol;

declare module 'recast' {
    import {BinaryExpression, Expression, ExpressionStatement, Literal, Node, Program, Statement} from 'estree';

    interface PrintResult {
        code: string;
    }

    interface Builders {
        binaryExpression(operator: string, left: Expression, right: Expression): BinaryExpression;

        expressionStatement(expression: Expression): ExpressionStatement;

        literal(value: primitive): Literal;

        program(statements: Statement[]): Program;

    }

    export function parse(code: string): { program: Node };

    export function print(node: Node): PrintResult;

    export const types: { builders: Builders };
}
