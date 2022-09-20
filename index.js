import * as core from '@actions/core';
import * as fs from 'fs';
import File from './src/file.js';

try {
  const summaryTableHeadings = [
    { data: 'File', header: true },
    { data: 'Warnings', header: true },
    { data: 'Errors', header: true },
    { data: 'Result', header: true }
  ]
  const eslintInput = core.getInput('eslint-json')
  const reportTitle = core.getInput('title')

  let _root = eslintInput

  if (typeof(eslintInput) == 'string') {
    if (fs.existsSync(eslintInput)) { 
      core.debug(`Input appears to be a path: ${eslintInput}`)
      _root = fs.readFileSync(eslintInput)
    }
    _root = JSON.parse(_root)
    core.debug(`Input JSON parsed`)
  } else { 
    core.debug(`Input is not a string... treating this raw JSON`)
    _root = eslintInput
  }
  
  const root = _root
  if (!root) {
    core.debug('JSON root is undefined')
    throw 'Input could not be parsed as valid JSON'
  }
  // Code below uses the variable name "report" to reduce confusion with the "summary" of the report
  // Note: the GitHub Actions toolkit refers to what the report actually is as a Summary
  let summaryTable = [summaryTableHeadings]
  let fileSections = []
  for (const file of root.map(data => new File(data))) {
    summaryTable.push(file.toRow())
    if (!file.pass) {
      fileSections.push(file.toSection())
    }
  }

  [[reportTitle, summaryTable], ...fileSections].forEach((section, index) => {
    let [heading, table] = section
    // Set the heading level to 3 (`###`) for every heading other than the report title
    core.summary.addHeading(heading, index > 0 ? 3 : 2)
    core.summary.addTable(table)
  })

  core.setOutput('report', core.summary.stringify())
  core.summary.write()

} catch (error) {
  core.setFailed(error.message);
}