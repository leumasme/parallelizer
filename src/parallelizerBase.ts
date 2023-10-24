import EventEmitter from "events"
import TypedEmitter from "typed-emitter"

type ParallelizerEvents<R, D> = {
    "finish": (results: R[]) => void,
    "data": (data: R, elem: D) => void,
    "error": (error: Error, elem: D) => void
}

export abstract class ParallelizerBase<R, D>
    extends (EventEmitter as { new <T, D>(): TypedEmitter<ParallelizerEvents<T, D>> })<R, D> {
    results: R[] = [];
    completed = 0;
    started = 0;
    stopped = false;
    protected constructor(
        public readonly parallelism: number,
        protected readonly execute: (elem: D) => Promise<R>,
        protected readonly keepData = true
    ) { super() }

    start() {
        if (this.started > 0) throw new Error("Already started");
        this.startAsNeeded();
    }
    stop() {
        this.stopped = true;
    }
    getRunningTasksCount() {
        return this.started - this.completed;
    }
    hasRunningTasks() {
        return this.getRunningTasksCount() > 0;
    }
    waitForCompletion() {
        return new Promise(resolve => {
            this.once("finish", resolve);
        })
    }
    protected abstract startNext(): void;
    protected abstract hasWorkLeft(): boolean;
    protected startAsNeeded() {
        while (this.getRunningTasksCount() < this.parallelism && this.hasWorkLeft()) {
            this.startNext();
        }
    }
    protected taskFinished() {
        this.completed++;

        if (this.stopped) {
            if (!this.hasRunningTasks()) {
                this.finalize();
            }
            return;
        }

        if (this.hasWorkLeft()) {
            this.startAsNeeded();
        } else if (!this.hasRunningTasks()) {
            this.finalize();
        }
    }
    protected executeForElem(elem: D) {
        let exec = this.execute(elem);
        this.started++;
        exec.then((data) => {
            if (this.keepData) this.results.push(data);

            this.emit("data", data, elem);
            this.taskFinished()
        }).catch((e) => {
            this.emit("error", e, elem);
            this.taskFinished()
        })
    }
    protected finalize() {
        this.emit("finish", this.results);
    }
}