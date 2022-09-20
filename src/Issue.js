import { convertInlineCode, symbols } from './helpers.js'

export default class Issue {
    constructor(data) {
        // Escape any pipe characters "|" that might exist in string 
        // data to prevent conflicts with GitHub Markdown's table syntax
        this.ruleId = data.ruleId.replace(/\|/g, '\|')
        this.message = data.message.replace(/\|/g, '\|')
        this.messageType = data.messageId.replace(/\|/g, '\|')
        this.severity = data.severity > 0 ? (data.severity > 1 ? `${symbols.error} Error` : `${symbols.warn} Warn`) : `${symbols.info} Info`
        this.lnRange = [data.line, data.endLine]
        this.colRange = [data.column, data.endColumn]
    }

    /** 
     * Return an array containing info about this Issue for use within a table.
     * @returns {Array}
     */
    toRow() {
        return [
            this.severity.toString(),
            this.lnRange[0] == this.lnRange[1] ? this.lnRange[0].toString() : this.lnRange.join(':'),
            this.colRange[0].toString(), 
            `${convertInlineCode(this.message)}`, 
            `${convertInlineCode(`\`${this.messageType}\` \(\`${this.ruleId}\`\)`)}`
        ]
    }
}