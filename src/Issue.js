import { symbols, tdCenter, toLink, convertInlineCode, wrap } from './helpers.js'

export default class Issue {
    /**
     * Create a generic ESLint issue within a file
     * 
     * @param {File} parentFile File instance this issue is associated with
     * @param {Object} data Object containing data about this issue
     * 
     * @returns {Issue} An new Issue instance
     */
    constructor(parentFile, data) {
        this.parentFile = parentFile
        // Escape any pipe characters "|" that might exist in string data to prevent conflicts with GitHub Markdown's table rendering
        this.ruleId = data.ruleId.replace(/\|/g, '\|')
        this.message = data.message.replace(/\|/g, '\|')
        this.messageType = data.messageId.replace(/\|/g, '\|')
        this.fixable = data.fix
        this.severity = data.severity > 0 ? (data.severity > 1 ? `${wrap(symbols.error, 'i')} Error` : `${wrap(symbols.warn, 'i')} Warn`) : `${wrap(symbols.info, 'i')} Info`
        this.lnRange = [data.line, data.endLine]
        this.colRange = [data.column, data.endColumn]
    }

    /** 
     * Return an array formatted table row containing info about this Issue
     * 
     * @returns {string[]} Array formatted table row
     */
    toRow() {
        // Prepare a link to the relevant line or range of lines corresponding to this Issue
        const lnText = this.lnRange[0] == this.lnRange[1] ? `${this.lnRange[0]}` : this.lnRange.join(':')
        const lnAnchor = `#L${this.lnRange[0]}-L${this.lnRange[1]}`
        const lnLink = toLink(lnText, `${this.parentFile.url}${lnAnchor}`, true)

        // Format additional information about this Issue
        const severityCell = [this.severity, tdCenter]
        const fixableCell = [this.fixable ? symbols.fix : symbols.noFix, tdCenter]
        const colText = this.colRange[0].toString()
        const ruleInfo = `${this.messageType} (${this.ruleId})`

        // ESLint messages can contain one or more block of inline code (usally enclosed by backticks "`"). 
        // These blocks may be nested (e.g., a code block containing a template literal), so we need parse them appropriately.
        const eslintMessage = convertInlineCode(this.message, true)
        return [severityCell, lnLink, colText, eslintMessage, fixableCell, ruleInfo]
    }
}