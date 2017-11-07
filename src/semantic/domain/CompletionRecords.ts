import {readVariable} from '../rules/Basic';
import {RuleExpression} from '../rules/expression/RuleExpression';
import {constant} from '../rules/expression/RuleNoVarExpresion';
import {RuleParamExpression, SimpleCalculator} from '../rules/expression/RuleParamExpression';
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
    constructor(readonly value: JSValue) {
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
    return new RuleParamExpression(new SimpleCalculator(arg => !(arg instanceof NormalCompletionRecord)), cr);
}

export function getNormalValue(cr: RuleExpression<CompletionRecord>): RuleExpression<JSValue | Empty> {
    return new RuleParamExpression(new SimpleCalculator(arg => (arg as NormalCompletionRecord).value), cr);
}

export function normalCompletion(value: RuleExpression<JSValue | Empty>): RuleExpression<NormalCompletionRecord> {
    return new RuleParamExpression<NormalCompletionRecord, JSValue | Empty>(
        new SimpleCalculator(arg => new NormalCompletionRecord(arg)),
        value
    );
}

export function throwCompletion(value: RuleExpression<JSValue>): RuleExpression<ThrowCompletionRecord> {
    return new RuleParamExpression<ThrowCompletionRecord, JSValue>(
        new SimpleCalculator(arg => new ThrowCompletionRecord(arg)),
        value
    );
}

export function isEmptyValue(value: RuleExpression<JSValue | Empty>): RuleExpression<boolean> {
    return new RuleParamExpression(new SimpleCalculator(arg => arg === EMPTY), value);
}

export function returnIfAbrupt(variableName: string): RuleStatement {
    return new RuleIfStatement(
        isAbrupt(readVariable(variableName)),
        new RuleReturn(readVariable(variableName)),
        new RuleLetStatement(variableName, getNormalValue(readVariable(variableName)))
    );
}
