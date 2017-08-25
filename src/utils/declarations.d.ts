type literalable = boolean | string | number | null;

type primitive = literalable | void | symbol;

declare module 'recast' {
    import {Expression, ExpressionStatement, Literal, Node, Program, Statement} from 'estree';

    interface PrintResult {
        code: string;
    }

    interface Builders {
        expressionStatement(expression: Expression): ExpressionStatement;

        literal(value: primitive): Literal;

        program(statements: Statement[]): Program;

    }

    export function parse(code: string): { program: Node };

    export function print(node: Node): PrintResult;

    export const types: { builders: Builders };
}
