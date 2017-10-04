import {Evaluation} from './Evaluation';
import {Optimized} from './Optimized';

export interface Executable<T extends Executable<T>> {
    execute(evaluation: Evaluation, confident: boolean): Optimized<T>;
}
