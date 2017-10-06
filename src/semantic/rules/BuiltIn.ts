import {CompletionRecord, NormalCompletionRecord} from '../domain/CompletionRecords';
import {JSValue} from '../domain/js/JSValue';
import {newObject, ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {RuleExpression, RuleUnaryExpression, SimpleUnaryCalculator} from './RuleExpression';

export function toNumber(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new RuleUnaryExpression(param, new SimpleUnaryCalculator(arg => {
        if (arg instanceof PrimitiveValue) {
            return new NormalCompletionRecord(new PrimitiveValue(+(arg.value as any)));
        } else {
            throw new Error('Converting object to primitive');
        }
    }));
}

export function toBoolean(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new RuleUnaryExpression(param, new SimpleUnaryCalculator(arg => {
        let result;
        if (arg instanceof PrimitiveValue) {
            result = !!(arg.value as any);
        } else {
            result = true;
        }
        return new NormalCompletionRecord(new PrimitiveValue(result));
    }));
}

export function toPrimitive(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new RuleUnaryExpression(param, new SimpleUnaryCalculator(arg => {
        if (arg instanceof PrimitiveValue) {
            return new NormalCompletionRecord(arg);
        } else {
            throw new Error('Converting object to primitive');
        }
    }));
}

export function toString(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new RuleUnaryExpression(param, new SimpleUnaryCalculator(arg => {
        if (arg instanceof PrimitiveValue) {
            return new NormalCompletionRecord(new PrimitiveValue('' + (arg.value as any)));
        } else {
            throw new Error('Converting object to primitive');
        }
    }));
}

export function referenceError(): RuleExpression<ObjectValue> {
    return newObject(null);
}
