import { ParallelizerBase } from "./parallelizerBase.js"

export class Parallelizer<R> extends ParallelizerBase<R, number> {
    constructor(
        parallelism: number,
        private readonly limit: number,
        execute: (elem: number) => Promise<R>,
        keepData = true
    ) {
        super(parallelism, execute, keepData);
    }
    protected hasWorkLeft() {
        return this.started < this.limit;
    }
    protected startNext() {
        this.executeForElem(this.started++);
    }
    protected finalize() {
        this.emit("finish", this.results);
    }
}