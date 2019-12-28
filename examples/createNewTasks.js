const scaleapi = require('../lib/scaleapi.js'); // Change to just "scaleapi" for your project
const fs = require('fs');

// HOW IT WORKS:
// Given a .csv file or array of information to make tasks from (often attachment urls),
// go through and submit Tasks to Scale for each row.

// You will want to specify which task creation method you'd like to use, as well as
// any input parameters relating to how you'd like your task completed

// INPUT PARAMETERS:
const API_KEY = 'live_xxxxx';
const DO_DRY_RUN = true;
const fileName = 'list/of/attachment_urls_and_other_data.csv'

const client = scaleapi.ScaleClient(API_KEY);

(async function () {
  // ====================
  // === READ IN ROWS ===
  // ====================

  // Read in Task Details from CSV
  let rows = readCsv(fileName);

  // Alternatively, create just an array of rows to create Tasks from
  // let rows = [
  //   'https://www.scale.com/img/is/awesome.jpg'
  // ]

  // ====================
  // === PROCESS ROWS ===
  // ====================

  // Process each row as needed
  rows = rows.map(row => row.split(',')[0].trim());

  console.log(`Number of Rows Found: ${rows.length}`);

  // ====================
  // === CREATE TASKS ===
  // ====================

  if (rows.length > 0) {
    await Promise.map(
      rows,
      async row => {
        if (DO_DRY_RUN) {
          console.log('Creating Task for ' + row);
        } else {
          await new Promise((resolve, reject) => {
            client.createAnnotationTask(
              {
                callback_url: 'http://www.example.com/callback',
                project: 'coolest_project_name',
                objects_to_annotate: ['person', 'land vehicle'],
                with_labels: true,
                attachment: row,
                attachment_type: 'image',
              },
              (err, task) => {
                // do something with task
                if (err) {
                  console.error(err);
                  reject(err);
                } else {
                  console.log(`Task Created: ${task.task_id}`);
                  resolve();
                }
              },
            );
          });
        }
      },
      { concurrency: 5 },
    );

    console.log('Finished Running Script');
  }
}());

function readCsv(fileName, hasHeader = false) {
  const rows =
    fs.readFileSync(fileName, { encoding: 'utf8' })
      .split('\n')
      .map(s => s.trim()) || [];

  return hasHeader && rows.length > 0 ? rows.splice(1) : rows;
}