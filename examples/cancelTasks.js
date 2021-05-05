const scaleapi = require('scaleapi'); // Change to "../lib/scaleapi.js" if you intend to run in this repo
const fs = require('fs');

// HOW IT WORKS:
// Given a .csv file or array of task ids you'd like cancelled,
// go through and cancel Tasks for each row.

// INPUT PARAMETERS:
const API_KEY = 'live_xxxxx';
const DO_DRY_RUN = true;
const fileName = 'list/of/task/ids_to_cancel.csv'

const client = scaleapi.ScaleClient(API_KEY);

(async function () {
  // ====================
  // === READ IN ROWS ===
  // ====================

  // Read in Task Details from CSV
  let rows = readCsv(fileName);

  // Alternatively, create just an array of rows to cancel Tasks from
  // let rows = [
  //   '5d4121900591c138750xxxxx'
  // ]

  // ====================
  // === PROCESS ROWS ===
  // ====================

  // Process each row as needed
  rows = rows.map(row => row[0]).filter(id => id.length === 24);

  console.log(`Number of Rows Found: ${rows.length}`);

  // ====================
  // === CANCEL TASKS ===
  // ====================

  await Promise.map(
    rows,
    async row => {
      if (DO_DRY_RUN) {
        console.log('Would be cancelling Task Id: ' + row);
      } else {
        await new Promise((resolve, reject) => {
          client.cancelTask(row, (err, task) => {
            // do something with task
            if (err) {
              console.error(err);
              reject(err);
            } else {
              console.log(`Task Cancelled: ${task.task_id}`);
              resolve();
            }
          });
        });
      }
    },
    { concurrency: 10 },
  );

  console.log('Finished Running Script');
}());

function readCsv(fileName, hasHeader = false) {
  const rows =
    fs.readFileSync(fileName, { encoding: 'utf8' })
      .split('\n')
      .map(r => r.split(",").map(s => s.trim())) || [];

  return hasHeader ? rows.splice(1) : rows;
}