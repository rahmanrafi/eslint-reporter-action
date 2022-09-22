import Issue from './issue.js';
import { symbols, github, toLink, toCustomTable, wrap, pluarlize, convertInlineCode } from './helpers.js'

export default class File {
    static tableHeadings = [
        { data: 'Severity', header: true },
        { data: 'Line', header: true },
        { data: 'Column', header: true },
        { data: 'Message', header: true },
        { data: 'Fixable', header: true },
        { data: 'Issue Type (Rule ID)', header: true }
    ]

    /**
     * Create a generic file described by ESLint results
     * 
     * @param {Object} data Object containing data about this file
     * 
     * @returns {File} A new File instance
     */
    constructor(data) {
        this.path = data.filePath.replace(github.workdir, '').replace(/^([/\\]+)/, '').replace(/(\\)/, '/')
        this.errorCount = data.errorCount
        this.fatalErrorCount = data.fatalErrorCount
        this.fixableErrorCount = data.fixableErrorCount
        this.warningCount = data.warningCount
        this.fixableWarningCount = data.fixableWarningCount
        this.issues = data.messages.map(message => new Issue(this, message))
        this.pass = this.issues.length == 0
        this.url = `${github.server}/${github.repo}/${github.blobSubdir}/${github.sha}/${this.path}`
    }

    /**
     * Update an object containing summary data for an ESLint run
     * 
     * @param {Object} data Summary data to update
     * 
     * @returns {Object} Updated summary data object
     */
    updateSummaryData(data) {
        data.files++
        data.passFiles += this.pass ? 1 : 0
        if (this.warningCount) {
            data.warningFiles++
            data.warningTotal += this.warningCount
            data.warningFixable += this.fixableWarningCount
        }
        if (this.errorCount) {
            data.errorFiles++
            data.errorTotal += this.errorCount
            data.errorFixable += this.fixableErrorCount
        }
        if (this.fatalErrorCount) {
            data.fatalErrorFiles++
            data.fatalErrorTotal += this.fatalErrorCount
        }
        return data
    }

    /**
     * Return an array containing a raw HTML heading and table for this File
     *
     * @returns {string[]} Heading and table raw HTML elements
     */
    toSection() {
        const heading = wrap(wrap(this.toHeading(), 'h3'), 'summary')
        return wrap(`${heading}${this.toTable()}`, 'details', true)
    }

    /** 
     * Return an HTML table containing information about ESLint issues found within this File
     * 
     * @returns {string} Raw HTML table containing information about issues found within this File
     */
    toTable() {
        const tableArray = this.pass ? [] : [File.tableHeadings]
        for (const issue of this.issues) {
            tableArray.push(issue.toRow())
        }
        return toCustomTable(tableArray, this.path.toLowerCase())
    }

    /**
     * Return an HTML heading about this File for use within a section in a report
     * 
     * @returns {string} Raw HTML heading
     */
    toHeading() {
        // The start of the heading (i.e., the filename), should link directly to the blob view for it at the associated commit
        const heading = `${toLink(this.path, this.url, true)}: `
        const issueCountHeadings = []

        // Append details about warning and/or error counts to this heading
        if (this.errorCount) {
            let errorsHeading = `${this.errorCount} ${pluarlize(this.errorCount, 'error')}`
            // Include fatal error counts with the normal error counts (e.g., 4 errors (1 fatal))
            if (this.fatalErrorCount || this.fixableErrorCount) {
                const errorsAppendix = []
                if (this.fatalErrorCount) {
                    errorsAppendix.push(`${this.fatalErrorCount} fatal`)
                }
                if (this.fixableErrorCount) {
                    errorsAppendix.push(`${this.fixableErrorCount} fixable`)
                }
                errorsHeading += ` (${errorsAppendix.join(', ')})`
            }
            issueCountHeadings.push(errorsHeading)
        }
        if (this.warningCount) {
            let warningsHeading = `${this.warningCount} ${pluarlize(this.warningCount, 'warning')}`
            warningsHeading += this.fixableWarningCount ? ` (${this.fixableWarningCount} fixable)` : ''
            issueCountHeadings.push(warningsHeading)
        }

        return `${heading}${issueCountHeadings.join(', ')}`
    }

    /**
     * Return an array formatted table row summarizing ESLint results for this File
     * 
     * @returns {string[]} Array formatted table row
     */
    toRow() {
        // If the file contains issues, there will be a corresponding table and section for it within the report.
        // For these files, we can link from the summary table to the relevant section using anchor ('#') tags.
        // NOTE: GitHub's markup processing appears to convert id values to lowercase and prefixes them with "user-content-".
        const filepathCell = this.pass ? this.path : toLink(this.path, `#${github.anchorPrefix}${this.path.toLowerCase()}`, true)
        return [
            filepathCell,
            this.warningCount.toString(),
            this.fatalErrorCount ? `${this.errorCount} (${this.fatalErrorCount})` : this.errorCount.toString(),
            this.pass ? symbols.pass : symbols.error
        ]
    }
}