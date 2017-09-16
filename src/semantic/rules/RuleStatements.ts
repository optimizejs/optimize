import {CompletionRecord} from '../domain/CompletionRecords';
import {RuleExpression} from './RuleExpression';

export class RuleFunction {
    constructor(private paramNames: string[], readonly body: RuleStatement[]) {
    }
}

export class RuleStatement {
    st: 1;
}

export class RuleBlockStatement extends RuleStatement {
    constructor(private body: RuleStatement[]) {
        super();
    }
}

export class RuleLetStatement extends RuleStatement {
    constructor(readonly variableName: string, readonly expression: RuleExpression<any>) {
        super();
    }
}

export class RuleReturn extends RuleStatement {
    constructor(readonly expression: RuleExpression<CompletionRecord>) {
        super();
    }
}

export class RuleIfStatement extends RuleStatement {
    constructor(private test: RuleExpression<boolean>, private consequent: RuleStatement,
                private alternate: RuleStatement) {

        super();
    }
}

export class RuleEmptyStatement extends RuleStatement {
}
