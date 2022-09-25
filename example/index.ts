import { Parallelizer } from "@leumasme/parallelizer";

// How many to run at the same time
let parallelism = 10;
// How many to run in total
let total = 50;

let para = new Parallelizer(parallelism, total, someAsyncTask);

para.on("data", (data, id)=>{
    // This event is called whenever a task is completed with the data it returned
    console.log(`Task ${id} returned ${data}`);
});

para.on("finish", (allData)=>{
    // This event is called when all tasks are completed with an array of all the results
    // If you do not need all the result data at the end, pass `false` as the 4th argument to Parallelizer
    // In that case, allData will be an empty array. This is useful if you need to save memory on a lot of tasks
    console.log("All tasks completed");
});

para.on("error", (err, id)=>{
    // This event is called whenever a task throws an error
    console.log(`Task ${id} threw an error: ${err}`);
});

para.start();

// returns a random number after 1 second
// implement your own async task here, like sending a http request
function someAsyncTask() {
    return new Promise<number>(resolve=>{
        setTimeout(()=>{
            resolve(Math.random());
        }, Math.random() * 1000);
    });
}