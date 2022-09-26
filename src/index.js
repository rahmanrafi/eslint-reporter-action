import * as core from '@actions/core';
import * as fs from 'fs';
import File from './file.js';
import { symbols, pluarlize, toNestedUl, toCode } from './helpers.js'

try {
  const summaryTableHeadings = [
    { data: 'File', header: true },
    { data: 'Warnings', header: true },
    { data: 'Errors', header: true },
    { data: 'Result', header: true }
  ]
  const eslintInput = core.getInput('json')
  const reportTitle = core.getInput('title')
  const root = parseResults(eslintInput)

  const problemFiles = []
  const summaryTable = [summaryTableHeadings]
  let summaryData = {
    'files': 0,
    'passFiles': 0,
    'warningTotal': 0,
    'warningFiles': 0,
    'warningFixable': 0,
    'errorTotal': 0,
    'errorFiles': 0,
    'errorFixable': 0,
    'fatalErrorTotal': 0,
    'fatalErrorFiles': 0
  }

  for (const file of root.map(data => new File(data))) {
    summaryTable.push(file.toRow())
    summaryData = file.updateSummaryData(summaryData)
    if (!file.pass) {
      problemFiles.push(file)
    }
  }
  genSummary(reportTitle, summaryData, summaryTable, problemFiles)

  core.setOutput('report', core.summary.stringify())
  core.summary.write()

} catch (error) {
  console.error(error.name)
  console.error(error.stack)
  core.setFailed(error.message);
}

/**
 * Generate a GitHub Actions summary object
 * 
 * @param {string} title Title to use for the GitHub Actions summary
 * @param {Object} summaryData Object containing ESLint result summary data
 * @param {Array[]} summaryTable 2-dimensional array containing tabular data
 * @param {File[]} files Array of File instances to process
 */
function genSummary(title, summaryData, summaryTable, files) {
  const fixCommand = toCode('--fix', true)
  core.summary.addHeading(title, 2)
  core.summary.addHeading('Summary', 3)

  // Create sublist(s) for warnings and/or errors that may have been found. 
  // If their respective counts are 0, the corresponding sublist won't be added.
  let warningSubList = null
  if (summaryData.warningTotal) {
    warningSubList = [
      `${summaryData.warningFiles} individual ${pluarlize(summaryData.warningFiles, 'file')} contained warnings`,
      `${summaryData.warningFixable} ${pluarlize(summaryData.warningFixable, 'warning')} can be fixed using ${fixCommand}`
    ]
  }

  let errorSubList = null
  let fatalErrorSubList = !summaryData.fatalErrorTotal ? null : [`${summaryData.fatalErrorFiles} individual ${pluarlize(summaryData.fatalErrorFiles, 'file')} contained fatal errors`]
  if (summaryData.errorTotal) {
    errorSubList = [
      `${summaryData.errorFiles} individual ${pluarlize(summaryData.errorFiles, 'file')} contained errors`,
      `${summaryData.errorFixable} ${pluarlize(summaryData.errorFixable, 'error')} can be fixed using ${fixCommand}`,
      `${summaryData.fatalErrorTotal} total ${pluarlize(summaryData.fatalErrorTotal, 'fatal error')}`, fatalErrorSubList
    ]
  }

  const summaryList = [
    `${symbols.file} ${summaryData.files} ${pluarlize(summaryData.files, 'file')} linted`,
    `${symbols.pass} ${summaryData.passFiles} ${pluarlize(summaryData.passFiles, 'file')} had no issues`,
    `${symbols.warn} ${summaryData.warningTotal} total ${pluarlize(summaryData.warningTotal, 'warning')}`, warningSubList,
    `${symbols.error} ${summaryData.errorTotal} total ${pluarlize(summaryData.errorTotal, 'error')}`, errorSubList
  ]
  core.summary.addRaw(toNestedUl(summaryList))
  core.summary.addTable(summaryTable)

  files.forEach((file) => {
    core.summary.addRaw(file.toSection())
  })
}

/**
 * Return parsed JSON ESLint linting results 
 * 
 * @param {any} input Potential ESLint result JSON (stringified or otherwise)
 * 
 * @returns {Object} Object of ESLint linting results
 */
function parseResults(input) {
  let root
  if (typeof (input) == 'string') {
    if (fs.existsSync(input)) {
      core.debug(`Input appears to be a path: ${input}`)
      root = fs.readFileSync(input)
    }
    root = JSON.parse(root)
    core.debug(`Input JSON parsed`)
  } else {
    core.debug(`Input is not a string... treating this raw JSON`)
    root = input
  }

  if (!root) {
    core.debug('ESLint results JSON could not be read')
    throw 'Input could not be parsed as valid JSON'
  }

  return root
}