type literalable = boolean | string | number | null;

type primitive = literalable | void | symbol;

declare module 'recast' {
    import {
        ArrayExpression,
        ArrayPattern,
        AssignmentExpression,
        AssignmentOperator,
        AssignmentPattern,
        AssignmentProperty,
        BinaryExpression,
        BlockStatement,
        BreakStatement,
        CatchClause,
        ClassBody,
        ClassDeclaration,
        ConditionalExpression,
        ContinueStatement,
        DebuggerStatement,
        Declaration,
        DoWhileStatement,
        ExportDefaultDeclaration,
        ExportNamedDeclaration,
        ExportSpecifier,
        Expression,
        ExpressionStatement,
        ForInStatement,
        ForOfStatement,
        ForStatement,
        FunctionDeclaration,
        FunctionExpression,
        Identifier,
        IfStatement,
        ImportDeclaration,
        ImportDefaultSpecifier,
        ImportNamespaceSpecifier,
        ImportSpecifier,
        LabeledStatement,
        Literal,
        LogicalExpression,
        MemberExpression,
        MetaProperty,
        MethodDefinition,
        NewExpression,
        Node,
        ObjectExpression,
        ObjectPattern,
        Pattern,
        Program,
        Property,
        RestElement,
        ReturnStatement,
        SequenceExpression,
        SimpleCallExpression,
        SpreadElement,
        Statement,
        Super,
        SwitchCase,
        SwitchStatement,
        TaggedTemplateExpression,
        TemplateElement,
        TemplateLiteral,
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
        WithStatement,
        YieldExpression
    } from 'estree';

    interface PrintResult {
        code: string;
    }

    interface Options {
        lineTerminator: string;
    }

    type MethodKind = 'constructor' | 'method' | 'get' | 'set';

    interface Builders {
        arrayExpression(elements: (Expression | SpreadElement)[]): ArrayExpression;

        arrayPattern(elements: Pattern[]): ArrayPattern;

        arrowFunctionExpression(params: Expression[], body: BlockStatement, expression: false): ArrayExpression;

        arrowFunctionExpression(params: Expression[], body: Expression, expression: true): ArrayExpression;

        assignmentExpression(operator: AssignmentOperator, left: Expression, right: Expression): AssignmentExpression;

        assignmentPattern(left: Pattern, right: Expression): AssignmentPattern;

        binaryExpression(operator: string, left: Expression, right: Expression): BinaryExpression;

        blockStatement(body: Statement[]): BlockStatement;

        breakStatement(label: Identifier | null): BreakStatement;

        callExpression(callee: Expression | Super, arguments: Array<Expression | SpreadElement>): SimpleCallExpression;

        catchClause(param: Pattern, guard: null, body: BlockStatement): CatchClause;

        classBody(body: MethodDefinition[]): ClassBody;

        classDeclaration(id: Identifier, body: ClassBody, superClass: null | Expression): ClassDeclaration;

        conditionalExpression(test: Expression, consequent: Expression, alternate: Expression): ConditionalExpression;

        continueStatement(label: Identifier | null): ContinueStatement;

        debuggerStatement(): DebuggerStatement;

        doWhileStatement(body: Statement, test: Expression): DoWhileStatement;

        exportAllDeclaration(exported: null, source: Literal): ExportDefaultDeclaration;

        exportDefaultDeclaration(declaration: Declaration | Expression): ExportDefaultDeclaration;

        exportNamedDeclaration(declaration: Declaration | null, specifiers: ExportSpecifier[],
                               source?: Literal | null): ExportNamedDeclaration;

        expressionStatement(expression: Expression): ExpressionStatement;

        forInStatement(left: VariableDeclaration | Pattern, right: Expression, body: Statement): ForInStatement;

        forOfStatement(left: VariableDeclaration | Pattern, right: Expression, body: Statement): ForOfStatement;

        forStatement(init: VariableDeclaration | Expression | null, test: Expression | null,
                     update: Expression | null, body: Statement): ForStatement;

        functionDeclaration(id: Identifier, params: Expression[], body: BlockStatement,
                            generator: boolean): FunctionDeclaration;

        functionExpression(id: Identifier | null, params: Expression[], body: BlockStatement,
                           generator: boolean): FunctionExpression;

        identifier(name: string): Identifier;

        ifStatement(test: Expression, consequent: Statement, alternate: Statement | null): IfStatement;

        importDeclaration(specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[],
                          source: Literal): ImportDeclaration;

        labeledStatement(label: Identifier, body: Statement): LabeledStatement;

        literal(value: primitive | RegExp): Literal;

        logicalExpression(operator: string, left: Expression, right: Expression): LogicalExpression;

        memberExpression(object: Expression | Super, property: Expression, computed: boolean): MemberExpression;

        metaProperty(meta: Identifier, property: Identifier): MetaProperty;

        methodDefinition(kind: MethodKind, key: Expression, value: FunctionExpression, st: boolean): MethodDefinition;

        newExpression(callee: Expression, arguments: Array<Expression | SpreadElement>): NewExpression;

        objectExpression(properties: Property[]): ObjectExpression;

        objectPattern(properties: AssignmentProperty[]): ObjectPattern;

        program(statements: Statement[]): Program;

        property(kind: 'init' | 'get' | 'set', key: Expression, value: Expression | Pattern): Property;

        restElement(argument: Pattern): RestElement;

        returnStatement(argument: Expression | null): ReturnStatement;

        sequenceExpression(expressions: Expression[]): SequenceExpression;

        spreadElement(argument: Expression): SpreadElement;

        super(): Super;

        switchCase(test: Expression | null, consequent: Statement[]): SwitchCase;

        switchStatement(discriminant: Expression, cases: SwitchCase[]): SwitchStatement;

        taggedTemplateExpression(tag: Expression, quasi: TemplateLiteral): TaggedTemplateExpression;

        templateLiteral(quasis: TemplateElement[], expressions: Expression[]): TemplateLiteral;

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

        yieldExpression(argument: Expression | null, delegate: boolean): YieldExpression;
    }

    export function parse(code: string): { program: Node };

    export function print(node: Node, options?: Options): PrintResult;

    export const types: { builders: Builders };
}
