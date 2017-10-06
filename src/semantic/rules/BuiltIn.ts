import {CompletionRecord, NormalCompletionRecord} from '../domain/CompletionRecords';
import {JSValue} from '../domain/js/JSValue';
import {newObject, ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {constant} from './Basic';
import {Optimized} from './Optimized';
import {
    RuleAbstractUnaryExpression,
    RuleExpression,
    RuleUnaryExpression,
    SimpleUnaryCalculator
} from './RuleExpression';

class ToNumberExpression extends RuleAbstractUnaryExpression<JSValue, CompletionRecord> {
    protected calculate(arg: JSValue): Optimized<RuleExpression<CompletionRecord>> {
        if (arg instanceof PrimitiveValue) {
            return Optimized.optimized(constant(new NormalCompletionRecord(new PrimitiveValue(+(arg.value as any)))));
        } else {
            return Optimized.original(this);
        }
    }

    protected copy(arg: RuleExpression<JSValue>): ToNumberExpression {
        return new ToNumberExpression(this.argument);
    }
}

class ToPrimitiveExpression extends RuleAbstractUnaryExpression<JSValue, CompletionRecord> {
    protected calculate(arg: JSValue): Optimized<RuleExpression<CompletionRecord>> {
        if (arg instanceof PrimitiveValue) {
            return Optimized.optimized(constant(new NormalCompletionRecord(arg)));
        } else {
            return Optimized.original(this);
        }
    }

    protected copy(arg: RuleExpression<JSValue>): ToPrimitiveExpression {
        return new ToPrimitiveExpression(this.argument);
    }
}

export function toNumber(argument: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new ToNumberExpression(argument);
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

export function toPrimitive(argument: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new ToPrimitiveExpression(argument);
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
