const scaleapi = require('../lib/scaleapi.js'); // Change to just "scaleapi" for your project
const fs = require('fs');

// HOW IT WORKS:
// Given a list of search filters ("PARAMS"), it will page through tasks and write 
// the output to a JSON file.


// INPUT PARAMETERS:
const API_KEY = 'live_xxxxx';

const MAX_TASKS_TO_RETURN = 100000; // Get up to the n most recently created tasks

const OUTPUT_FILE = '/the/place/to/put/it.json';

const PARAMS = { // All params optional
  type: 'annotation',
  status: 'completed',
  project: 'cool_project_name',
  completed_after: '2019-03-01T00:00:00.000Z'
};

(async function () {

  // ===============================
  // == MAIN FUNCTION WE CAN CALL ==
  // ===============================

  // Get list of task objects
  let getTasks = async function(client, maxTasksToReturn = 1000000, params = {}) {
    // Initialize everything
    const maxTasksReturnedPerCall = 100;
    let lastPageCount = maxTasksReturnedPerCall;
    let output = [];

    // Go through page by page
    while (lastPageCount == maxTasksReturnedPerCall && output.length < maxTasksToReturn) {
      
      // Skip ahead (offset) by the number of tasks already pulled
      params.offset = output.length;

      // Support asking for small number of tasks (like 5, 10, 50)
      params.limit = maxTasksReturnedPerCall;
      if (maxTasksToReturn - output.length < maxTasksReturnedPerCall) {
        params.limit = maxTasksToReturn - output.length
      } 

      try {
        // fetch some tasks
        let tasks = await new Promise((resolve, reject) => {
          client.tasks(params, (err, tasklist) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(tasklist);
            }
          });
        });

        // concat with output
        output = output.concat(tasks.docs);
        lastPageCount = tasks.docs.length;

        console.log(`Fetched ${output.length} tasks`);
      } catch(err) {
        console.error(err)
      }
    }

    console.log(`Finished fetching ${output.length} tasks`);

    return output;
  }

  // ============================
  // == CALL OUR MAIN FUNCTION ==
  // ============================

  const client = new scaleapi.ScaleClient(API_KEY);
  let tasks = await getTasks(client, MAX_TASKS_TO_RETURN, PARAMS);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tasks));
}());

