import {CompletionRecord, NormalCompletionRecord} from '../domain/CompletionRecords';
import {JSValue} from '../domain/js/JSValue';
import {newObject, ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {RuleExpression} from './expression/RuleExpression';
import {constant} from './expression/RuleNoVarExpresion';
import {RuleAbstractParamExpression, RuleParamExpression, SimpleCalculator} from './expression/RuleParamExpression';
import {Optimized} from './Optimized';

class ToNumberExpression extends RuleAbstractParamExpression<CompletionRecord, JSValue> {
    protected calculate(arg: JSValue): Optimized<RuleExpression<CompletionRecord>> {
        if (arg instanceof PrimitiveValue) {
            return Optimized.optimized(constant(new NormalCompletionRecord(new PrimitiveValue(+(arg.value as any)))));
        } else {
            return Optimized.original(this);
        }
    }

    protected copy(arg: RuleExpression<JSValue>): ToNumberExpression {
        return new ToNumberExpression(this.params[0]);
    }
}

class ToPrimitiveExpression extends RuleAbstractParamExpression<CompletionRecord, JSValue> {
    protected calculate(arg: JSValue): Optimized<RuleExpression<CompletionRecord>> {
        if (arg instanceof PrimitiveValue) {
            return Optimized.optimized(constant(new NormalCompletionRecord(arg)));
        } else {
            return Optimized.original(this);
        }
    }

    protected copy(arg: RuleExpression<JSValue>): ToPrimitiveExpression {
        return new ToPrimitiveExpression(this.params[0]);
    }
}

class ToStringExpression extends RuleAbstractParamExpression<CompletionRecord, JSValue> {
    protected calculate(arg: JSValue): Optimized<RuleExpression<CompletionRecord>> {
        if (arg instanceof PrimitiveValue) {
            const result = new NormalCompletionRecord(new PrimitiveValue('' + (arg.value as any)));
            return Optimized.optimized(constant(result));
        } else {
            return Optimized.original(this);
        }
    }

    protected copy(arg: RuleExpression<JSValue>): ToStringExpression {
        return new ToStringExpression(this.params[0]);
    }
}

export function toNumber(argument: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new ToNumberExpression(argument);
}

export function toBoolean(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new RuleParamExpression(new SimpleCalculator(arg => {
        let result;
        if (arg instanceof PrimitiveValue) {
            result = !!(arg.value as any);
        } else {
            result = true;
        }
        return new NormalCompletionRecord(new PrimitiveValue(result));
    }), param);
}

export function toPrimitive(argument: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new ToPrimitiveExpression(argument);
}

export function toString(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new ToStringExpression(param);
}

export function referenceError(): RuleExpression<ObjectValue> {
    return newObject(null);
}
