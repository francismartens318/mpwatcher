import { ValidationReport, TransactionValidationResult } from '../types';
import { format } from 'date-fns';

export class ReportGenerator {
  /**
   * Generate a validation report from transaction validation results
   */
  generateReport(results: TransactionValidationResult[]): ValidationReport {
    const validTransactions = results.filter(r => r.isValid).length;
    const invalidTransactions = results.filter(r => !r.isValid).length;

    const summary = {
      priceIssues: results.filter(r => !r.checks.priceCorrect).length,
      discountIssues: results.filter(r => !r.checks.discountExplained).length,
      partnerCutIssues: results.filter(r => !r.checks.partnerCutCorrect).length,
    };

    return {
      generatedAt: new Date().toISOString(),
      totalTransactions: results.length,
      validTransactions,
      invalidTransactions,
      results,
      summary,
    };
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(report: ValidationReport): string {
    const { totalTransactions, validTransactions, invalidTransactions, results, summary } = report;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Marketplace Transaction Validation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: #0052CC;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 10px 0;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #0052CC;
    }
    .summary-card.error .value {
      color: #DE350B;
    }
    .summary-card.success .value {
      color: #00875A;
    }
    .results {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .transaction {
      border-bottom: 1px solid #eee;
      padding: 15px 0;
    }
    .transaction:last-child {
      border-bottom: none;
    }
    .transaction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .transaction-id {
      font-weight: bold;
      color: #333;
    }
    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.valid {
      background: #E3FCEF;
      color: #00875A;
    }
    .badge.invalid {
      background: #FFEBE6;
      color: #DE350B;
    }
    .issue {
      margin: 8px 0;
      padding: 10px;
      border-radius: 4px;
      background: #FFF4E6;
      border-left: 3px solid #FF991F;
    }
    .issue.error {
      background: #FFEBE6;
      border-left-color: #DE350B;
    }
    .issue.warning {
      background: #FFF4E6;
      border-left-color: #FF991F;
    }
    .issue-message {
      font-weight: 500;
      margin-bottom: 5px;
    }
    .issue-details {
      font-size: 12px;
      color: #666;
      font-family: monospace;
    }
    .checks {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      font-size: 14px;
    }
    .check {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .check.pass::before {
      content: '✓';
      color: #00875A;
      font-weight: bold;
    }
    .check.fail::before {
      content: '✗';
      color: #DE350B;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Marketplace Transaction Validation Report</h1>
    <p>Generated on ${format(new Date(report.generatedAt), 'PPpp')}</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3>Total Transactions</h3>
      <div class="value">${totalTransactions}</div>
    </div>
    <div class="summary-card success">
      <h3>Valid</h3>
      <div class="value">${validTransactions}</div>
    </div>
    <div class="summary-card error">
      <h3>Invalid</h3>
      <div class="value">${invalidTransactions}</div>
    </div>
    <div class="summary-card ${summary.priceIssues > 0 ? 'error' : ''}">
      <h3>Price Issues</h3>
      <div class="value">${summary.priceIssues}</div>
    </div>
    <div class="summary-card ${summary.discountIssues > 0 ? 'error' : ''}">
      <h3>Discount Issues</h3>
      <div class="value">${summary.discountIssues}</div>
    </div>
    <div class="summary-card ${summary.partnerCutIssues > 0 ? 'error' : ''}">
      <h3>Partner Cut Issues</h3>
      <div class="value">${summary.partnerCutIssues}</div>
    </div>
  </div>

  <div class="results">
    <h2>Transaction Details</h2>
    ${results.map(result => this.generateTransactionHTML(result)).join('\n')}
  </div>
</body>
</html>
    `;

    return html;
  }

  private generateTransactionHTML(result: TransactionValidationResult): string {
    return `
    <div class="transaction">
      <div class="transaction-header">
        <div>
          <div class="transaction-id">${result.transactionId}</div>
          <div style="color: #666; font-size: 14px;">
            ${result.addonName} • ${format(new Date(result.saleDate), 'PP')}
          </div>
        </div>
        <span class="badge ${result.isValid ? 'valid' : 'invalid'}">
          ${result.isValid ? 'Valid' : 'Invalid'}
        </span>
      </div>

      <div class="checks">
        <div class="check ${result.checks.priceCorrect ? 'pass' : 'fail'}">
          Price Check
        </div>
        <div class="check ${result.checks.discountExplained ? 'pass' : 'fail'}">
          Discount Explanation
        </div>
        <div class="check ${result.checks.partnerCutCorrect ? 'pass' : 'fail'}">
          Partner Cut
        </div>
      </div>

      ${result.issues.length > 0 ? `
        <div style="margin-top: 10px;">
          ${result.issues.map(issue => `
            <div class="issue ${issue.severity}">
              <div class="issue-message">${issue.message}</div>
              ${issue.details ? `
                <div class="issue-details">${JSON.stringify(issue.details, null, 2)}</div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    `;
  }

  /**
   * Generate text report
   */
  generateTextReport(report: ValidationReport): string {
    const { totalTransactions, validTransactions, invalidTransactions, results, summary } = report;

    let text = '='.repeat(60) + '\n';
    text += 'MARKETPLACE TRANSACTION VALIDATION REPORT\n';
    text += '='.repeat(60) + '\n';
    text += `Generated: ${format(new Date(report.generatedAt), 'PPpp')}\n\n`;

    text += 'SUMMARY\n';
    text += '-'.repeat(60) + '\n';
    text += `Total Transactions: ${totalTransactions}\n`;
    text += `Valid:              ${validTransactions}\n`;
    text += `Invalid:            ${invalidTransactions}\n`;
    text += `Price Issues:       ${summary.priceIssues}\n`;
    text += `Discount Issues:    ${summary.discountIssues}\n`;
    text += `Partner Cut Issues: ${summary.partnerCutIssues}\n\n`;

    text += 'TRANSACTION DETAILS\n';
    text += '-'.repeat(60) + '\n\n';

    for (const result of results) {
      text += `Transaction: ${result.transactionId}\n`;
      text += `App:         ${result.addonName}\n`;
      text += `Date:        ${format(new Date(result.saleDate), 'PP')}\n`;
      text += `Status:      ${result.isValid ? 'VALID' : 'INVALID'}\n`;
      text += `Checks:      Price: ${result.checks.priceCorrect ? '✓' : '✗'} | `;
      text += `Discount: ${result.checks.discountExplained ? '✓' : '✗'} | `;
      text += `Partner: ${result.checks.partnerCutCorrect ? '✓' : '✗'}\n`;

      if (result.issues.length > 0) {
        text += '\nIssues:\n';
        for (const issue of result.issues) {
          text += `  [${issue.severity.toUpperCase()}] ${issue.message}\n`;
          if (issue.details) {
            text += `    Details: ${JSON.stringify(issue.details)}\n`;
          }
        }
      }

      text += '\n' + '-'.repeat(60) + '\n\n';
    }

    return text;
  }
}
