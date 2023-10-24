import { QueueParallelizer } from "@leumasme/parallelizer";

function doSomeStuff(data: number) {
    return new Promise<number>(resolve => {
        let number = Math.floor(Math.random() * 5 * data);
        setTimeout(() => resolve(number), Math.random() * 1000)
    });
}

// If you do not have a set number of tasks, but instead some initial tasks
// and want to add more as they are completed, use a QueueParallelizer instead
let para = new QueueParallelizer(5, [1, 2, 3], someAsyncTask);

async function someAsyncTask(data: number) {
    let result = await doSomeStuff(data);

    // In a Queue Parallelizer, you can add more tasks.
    // This is useful, for example, if you want to scrape a website and all the links on it:
    // You wouldn't know all the links when you start scraping,
    // so you add them to the queue as you get results
    if (result < 1000) para.pushToQueue(result);

    return result;
};

// Otherwise, it works the same as a regular Parallelizer
para.on("data", (data, input) => {
    console.log(`Task with input ${input} returned ${data}`);
});

para.on("finish", (allData) => {
    console.log("All tasks completed");
});

para.on("error", (err, id) => {
    console.log(`Task ${id} threw an error: ${err}`);
});

console.log("Starting")

para.start();