import type { NextApiRequest, NextApiResponse } from 'next';
import { AtlassianMarketplaceAPI } from '../../lib/atlassian-api';
import { TransactionValidator } from '../../lib/validator';
import { ReportGenerator } from '../../lib/report-generator';

type ResponseData = {
  success?: boolean;
  report?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | string>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get configuration from environment
    const apiToken = process.env.ATLASSIAN_API_TOKEN;
    const developerId = process.env.ATLASSIAN_DEVELOPER_ID;
    const partnerCutPercentage = parseFloat(process.env.PARTNER_CUT_PERCENTAGE || '20');

    if (!apiToken || !developerId) {
      return res.status(500).json({
        error: 'Missing required environment variables: ATLASSIAN_API_TOKEN and ATLASSIAN_DEVELOPER_ID',
      });
    }

    // Get query parameters
    const {
      startDate,
      endDate,
      appKey,
      format = 'json',
    } = req.query;

    // Initialize services
    const atlassianAPI = new AtlassianMarketplaceAPI(apiToken, developerId);
    const validator = new TransactionValidator(partnerCutPercentage);
    const reportGenerator = new ReportGenerator();

    // Fetch transactions
    console.log('Fetching transactions...');
    const transactions = await atlassianAPI.getTransactions(
      startDate as string,
      endDate as string,
      appKey as string
    );

    console.log(`Found ${transactions.length} transactions`);

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        report: {
          generatedAt: new Date().toISOString(),
          totalTransactions: 0,
          validTransactions: 0,
          invalidTransactions: 0,
          results: [],
          summary: {
            priceIssues: 0,
            discountIssues: 0,
            partnerCutIssues: 0,
          },
        },
      });
    }

    // Validate transactions
    console.log('Validating transactions...');
    const validationResults = await validator.validateTransactions(transactions);

    // Generate report
    console.log('Generating report...');
    const report = reportGenerator.generateReport(validationResults);

    // Return report in requested format
    if (format === 'html') {
      const html = reportGenerator.generateHTMLReport(report);
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } else if (format === 'text') {
      const text = reportGenerator.generateTextReport(report);
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(text);
    } else {
      return res.status(200).json({
        success: true,
        report,
      });
    }
  } catch (error: any) {
    console.error('Validation error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during validation',
    });
  }
}
