import {Label} from './Label';
import {unknown} from './rules/Helper';
import {RuleExpression} from './rules/RuleExpression';
import {Value} from './values/Value';

export abstract class CompletionRecord {
    private completionRecord: true;
}

export class NormalCompletionRecord extends CompletionRecord {
    constructor(private value: Value) {
        super();
    }
}

export class ThrowCompletionRecord extends CompletionRecord {
    constructor(private value: Value) {
        super();
    }
}

export class ReturnCompletionRecord extends CompletionRecord {
    constructor(private value: Value) {
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

export class RuleNormalCompletionRecordExpression implements RuleExpression<NormalCompletionRecord> {
    expression: NormalCompletionRecord;

    constructor(readonly value: RuleExpression<Value>) {
    }
}

export function isAbrupt(cr: RuleExpression<CompletionRecord>): RuleExpression<boolean> {
    return unknown();
}

export function getNormalValue(cr: RuleExpression<CompletionRecord>): RuleExpression<Value> {
    return unknown();
}

export function normalCompletion(value: RuleExpression<Value>): RuleExpression<NormalCompletionRecord> {
    return new RuleNormalCompletionRecordExpression(value);
}

export function throwCompletion(value: RuleExpression<Value>): RuleExpression<ThrowCompletionRecord> {
    return unknown();
}
