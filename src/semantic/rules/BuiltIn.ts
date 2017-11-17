import {CompletionRecord, NormalCompletionRecord} from '../domain/CompletionRecords';
import {JSValue} from '../domain/js/JSValue';
import {newObject, ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {RuleExpression} from './expression/RuleExpression';
import {constant} from './expression/RuleNoVarExpresion';
import {calculableExpression, maybeCalculableExpression} from './expression/RuleParamExpression';
import {Optimized} from './Optimized';

export function toNumber(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return maybeCalculableExpression(arg => {
        if (arg instanceof PrimitiveValue) {
            return Optimized.optimized(constant(new NormalCompletionRecord(new PrimitiveValue(+(arg.value as any)))));
        }
        return null;
    }, param);
}

export function toBoolean(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return calculableExpression(arg => {
        let result;
        if (arg instanceof PrimitiveValue) {
            result = !!(arg.value as any);
        } else {
            result = true;
        }
        return new NormalCompletionRecord(new PrimitiveValue(result));
    }, param);
}

export function toPrimitive(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return maybeCalculableExpression((arg) => {
        if (arg instanceof PrimitiveValue) {
            return Optimized.optimized(constant(new NormalCompletionRecord(arg)));
        }
        return null;
    }, param);
}

export function toString(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return maybeCalculableExpression((arg) => {
        if (arg instanceof PrimitiveValue) {
            const result = new NormalCompletionRecord(new PrimitiveValue('' + (arg.value as any)));
            return Optimized.optimized(constant(result));
        }
        return null;
    }, param);
}

export function referenceError(): RuleExpression<ObjectValue> {
    return newObject({hasCall: false});
}
