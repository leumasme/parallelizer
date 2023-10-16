import EventEmitter from "events"
import TypedEmitter from "typed-emitter"

type ParallelizerEvents<T> = {
    "finish": (results: T[]) => void,
    "data": (data: T, id: number) => void,
    "error": (error: Error, id: number) => void
}

export class Parallelizer<T> extends (EventEmitter as { new <T>(): TypedEmitter<ParallelizerEvents<T>> })<T> {
    results: T[] = [];
    completed = 0;
    started = 0;
    constructor(
        public readonly parallelism: number,
        public readonly limit: number,
        private readonly execute: (i: number) => Promise<T>,
        private readonly keepData = true
    ) {
        super()
    };
    start() {
        if (this.started > 0) throw new Error("Already started");
        for (let i = 0; i < Math.min(this.parallelism, this.limit); i++) {
            this.executeNth(i);
        }
    }
    private executeNth(i: number) {
        let exec = this.execute(i);
        this.started++;
        exec.then((data) => {
            if (this.keepData) this.results.push(data);
            
            this.emit("data", data, i);
            this.taskFinished()
        }).catch((e) => {
            this.emit("error", e, i);
            this.taskFinished()
        })
    }
    private taskFinished() {
        this.completed++;

        if (this.started < this.limit) {
            this.executeNth(this.started);
        }
        if (this.completed == this.limit) {
            this.finalize();
        }
    }
    private finalize() {
        this.emit("finish", this.results);
    }
}