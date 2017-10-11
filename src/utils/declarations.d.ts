type literalable = boolean | string | number | null;

type primitive = literalable | void | symbol;

declare module 'recast' {
    import {
        ArrayExpression,
        AssignmentExpression,
        AssignmentOperator,
        BinaryExpression,
        BlockStatement,
        BreakStatement,
        CatchClause,
        ConditionalExpression,
        ContinueStatement,
        DebuggerStatement,
        DoWhileStatement,
        Expression,
        ExpressionStatement,
        ForInStatement,
        ForStatement,
        FunctionDeclaration,
        FunctionExpression,
        Identifier,
        IfStatement,
        LabeledStatement,
        Literal,
        LogicalExpression,
        MemberExpression,
        NewExpression,
        Node,
        ObjectExpression,
        Pattern,
        Program,
        Property,
        ReturnStatement,
        SequenceExpression,
        SimpleCallExpression,
        SpreadElement,
        Statement,
        Super,
        SwitchCase,
        SwitchStatement,
        ThisExpression,
        ThrowStatement,
        TryStatement,
        UnaryExpression,
        UnaryOperator,
        UpdateExpression,
        UpdateOperator,
        VariableDeclaration,
        VariableDeclarator,
        WhileStatement,
        WithStatement
    } from 'estree';

    interface PrintResult {
        code: string;
    }

    interface Options {
        lineTerminator: string;
    }

    interface Builders {
        arrayExpression(elements: Expression[]): ArrayExpression;

        assignmentExpression(operator: AssignmentOperator, left: Expression, right: Expression): AssignmentExpression;

        binaryExpression(operator: string, left: Expression, right: Expression): BinaryExpression;

        blockStatement(body: Statement[]): BlockStatement;

        breakStatement(label: Identifier | null): BreakStatement;

        callExpression(callee: Expression | Super, arguments: Array<Expression | SpreadElement>): SimpleCallExpression;

        catchClause(param: Pattern, guard: null, body: BlockStatement): CatchClause;

        conditionalExpression(test: Expression, consequent: Expression, alternate: Expression): ConditionalExpression;

        continueStatement(label: Identifier | null): ContinueStatement;

        debuggerStatement(): DebuggerStatement;

        doWhileStatement(body: Statement, test: Expression): DoWhileStatement;

        expressionStatement(expression: Expression): ExpressionStatement;

        forInStatement(left: VariableDeclaration | Pattern, right: Expression, body: Statement): ForInStatement;

        forStatement(init: VariableDeclaration | Expression | null, test: Expression | null,
                     update: Expression | null, body: Statement): ForStatement;

        functionDeclaration(id: Identifier, params: Expression[], body: BlockStatement): FunctionDeclaration;

        functionExpression(id: Identifier | null, params: Expression[], body: BlockStatement): FunctionExpression;

        identifier(name: string): Identifier;

        ifStatement(test: Expression, consequent: Statement, alternate: Statement | null): IfStatement;

        labeledStatement(label: Identifier, body: Statement): LabeledStatement;

        literal(value: primitive | RegExp): Literal;

        logicalExpression(operator: string, left: Expression, right: Expression): LogicalExpression;

        memberExpression(object: Expression | Super, property: Expression, computed: boolean): MemberExpression;

        newExpression(callee: Expression, arguments: Array<Expression | SpreadElement>): NewExpression;

        objectExpression(properties: Property[]): ObjectExpression;

        program(statements: Statement[]): Program;

        property(kind: 'init' | 'get' | 'set', key: Expression, value: Expression | Pattern): Property;

        returnStatement(argument: Expression | null): ReturnStatement;

        sequenceExpression(expressions: Expression[]): SequenceExpression;

        switchCase(test: Expression | null, consequent: Statement[]): SwitchCase;

        switchStatement(discriminant: Expression, cases: SwitchCase[]): SwitchStatement;

        thisExpression(): ThisExpression;

        throwStatement(argument: Expression): ThrowStatement;

        tryStatement(block: BlockStatement, handler: CatchClause | null,
                     finalizer: BlockStatement | null): TryStatement;

        unaryExpression(operator: UnaryOperator, argument: Expression): UnaryExpression;

        updateExpression(operator: UpdateOperator, argument: Expression, prefix: boolean): UpdateExpression;

        variableDeclaration(kind: 'var' | 'let' | 'const', declarations: VariableDeclarator[]): VariableDeclaration;

        variableDeclarator(id: Pattern, init: Expression | null): VariableDeclarator;

        whileStatement(test: Expression, body: Statement): WhileStatement;

        withStatement(object: Expression, body: Statement): WithStatement;
    }

    export function parse(code: string): { program: Node };

    export function print(node: Node, options?: Options): PrintResult;

    export const types: { builders: Builders };
}
