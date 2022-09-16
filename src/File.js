import Issue from './Issue.js';

export default class File {
    static tableHeadings = [
        { data: 'Severity', header: true },
        { data: 'Line', header: true },
        { data: 'Column', header: true },
        { data: 'Message', header: true },
        { data: 'Issue Type (Rule ID)', header: true }
    ]

    constructor(data) {
        this.path = data.filePath
        this.errorCount = data.errorCount
        this.fatalErrorCount = data.fatalErrorCount
        this.warningCount = data.warningCount
        this.issues = data.messages.map(message => new Issue(message))
        this.pass = this.issues.length == 0
    }

    /**
     * Return an array containing a heading and table array for this File and associated ESLint issues.
     * @returns {Array}
     */
    toSection() {
        return [this.toHeading(), this.toTable()]
    }

    /** 
     * Return an array containing all ESLint issues found within this File.
     * @returns {Array}
     */
    toTable() {
        let tableArray = this.pass ? [] : [File.tableHeadings]
        for (const issue of this.issues) {
            tableArray.push(issue.toRow())
        }
        return tableArray
    }

    /**
     * Return a formatted string for this File for use as a section header.
     * @returns {String}
     */
    toHeading() {
        let heading = `${this.path}: `
        let issueCountHeadings = []
        if (this.errorCount) {
            let descriptor = this.errorCount == 1 ? 'error' : 'errors'
            let errorsHeading = `${this.errorCount} ${descriptor}`
            // If fatal errors exist, include them with the normal error counts. e.g., 4 errors (1 fatal)
            if (this.fatalErrorCount) {
                errorsHeading += ` (${this.fatalErrorCount} fatal)`
            }
            issueCountHeadings.push(errorsHeading)
        }

        if (this.warningCount) {
            let descriptor = this.warningCount == 1 ? 'warning' : 'warnings'
            let warningsHeading = `${this.warningCount} ${descriptor}`
            issueCountHeadings.push(warningsHeading)
        }

        heading += issueCountHeadings.join(', ')
        return heading
    }

    /**
     * Return an array containing info about this File for use within a table.
     * @returns {Array}
     */
    toRow() {
        // Parent table headings: | File | Warnings | Errors | Result |
        return [
            this.path, 
            this.warningCount.toString(), 
            this.fatalErrorCount ? `${this.errorCount} (${this.fatalErrorCount})` : this.errorCount.toString(), 
            this.pass ? ':heavy_check_mark:' : ':x:'
        ]
    }
}