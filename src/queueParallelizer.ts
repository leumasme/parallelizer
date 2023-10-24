import { ParallelizerBase } from "./parallelizerBase.js"

export class QueueParallelizer<R, D> extends ParallelizerBase<R, D> {
    private queue: D[] = [];
    constructor(
        parallelism: number,
        initialQueue: D[],
        execute: (elem: D) => Promise<R>,
        keepData = true
    ) {
        super(parallelism, execute, keepData);
        this.queue = initialQueue;
    }
    pushToQueue(elem: D | D[]) {
        if (Array.isArray(elem)) {
            this.queue.push(...elem);
        } else this.queue.push(elem);
        this.startAsNeeded();
    }
    protected hasWorkLeft() {
        return this.queue.length > 0;
    }
    protected startNext() {
        let elem = this.queue.shift();
        if (!elem) return;
        this.executeForElem(elem);
    }
    protected finalize() {
        this.emit("finish", this.results);
    }
}