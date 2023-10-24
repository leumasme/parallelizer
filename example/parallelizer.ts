import { Parallelizer } from "@leumasme/parallelizer";

// How many to run at the same time
let parallelism = 10;
// How many to run in total. If you want to run until `stop()` is called, pass Infinity.
let total = 50;

let para = new Parallelizer(parallelism, total, someAsyncTask);

para.on("data", (data, id) => {
    // This event is called whenever a task is completed with the data it returned
    console.log(`Task ${id} returned ${data}`);

    if (data > 0.95) {
        // If you do not want to start any new tasks, (ex. because we found the data we were looking for),
        // you can call `para.stop()` to prevent any new tasks from starting.
        // The `finish` event will still fire once all currently running tasks are completed.
        console.log("Found data >0.95, stopping early");
        para.stop()
    }
});

para.on("finish", (allData) => {
    // This event is called when all tasks are completed with an array of all the results
    // If you do not need all the result data at the end, pass `false` as the 4th argument to Parallelizer
    // In that case, allData will be an empty array. This is useful if you need to save memory on a lot of tasks
    console.log("All tasks completed");
});

para.on("error", (err, id) => {
    // This event is called whenever a task throws an error
    console.log(`Task ${id} threw an error: ${err}`);
});

para.start();

// returns a random number after 1 second
// implement your own async task here, like sending a http request
function someAsyncTask() {
    return new Promise<number>(resolve => {
        setTimeout(() => {
            resolve(Math.random());
        }, Math.random() * 1000);
    });
}
