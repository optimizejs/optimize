import {constant, readVariable} from '../rules/Basic';
import {RuleExpression, RuleUnaryExpression} from '../rules/RuleExpression';
import {RuleIfStatement, RuleLetStatement, RuleReturn, RuleStatement} from '../rules/RuleStatements';
import {JSValue} from './js/JSValue';
import {Label} from './Label';

class Empty {
    empty: true;
}

const EMPTY = new Empty();

export abstract class CompletionRecord {
    private completionRecord: true;
}

export class NormalCompletionRecord extends CompletionRecord {
    constructor(readonly value: JSValue | Empty) {
        super();
    }
}

export class ThrowCompletionRecord extends CompletionRecord {
    constructor(private value: JSValue) {
        super();
    }
}

export class ReturnCompletionRecord extends CompletionRecord {
    constructor(private value: JSValue) {
        super();
    }
}

export class BreakCompletionRecord extends CompletionRecord {
    constructor(private label: Label | null) {
        super();
    }
}

export class ContinueCompletionRecord extends CompletionRecord {
    constructor(private label: Label | null) {
        super();
    }
}

export const EMPTY_COMPLETION = normalCompletion(constant(EMPTY));

export function isAbrupt(cr: RuleExpression<CompletionRecord>): RuleExpression<boolean> {
    return new RuleUnaryExpression(cr, arg => !(arg instanceof NormalCompletionRecord));
}

export function getNormalValue(cr: RuleExpression<CompletionRecord>): RuleExpression<JSValue | Empty> {
    return new RuleUnaryExpression(cr, arg => (arg as NormalCompletionRecord).value);
}

export function normalCompletion(value: RuleExpression<JSValue | Empty>): RuleExpression<NormalCompletionRecord> {
    return new RuleUnaryExpression(value, arg => new NormalCompletionRecord(arg));
}

export function throwCompletion(value: RuleExpression<JSValue>): RuleExpression<ThrowCompletionRecord> {
    return new RuleUnaryExpression(value, arg => new ThrowCompletionRecord(arg));
}

export function isEmptyValue(v: RuleExpression<JSValue | Empty>): RuleExpression<boolean> {
    throw new Error('not implemented yet');
}

export function returnIfAbrupt(variableName: string): RuleStatement {
    return new RuleIfStatement(
        isAbrupt(readVariable(variableName)),
        new RuleReturn(readVariable(variableName)),
        new RuleLetStatement(variableName, getNormalValue(readVariable(variableName)))
    );
}
