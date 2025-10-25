# Marketplace Transaction Validator

A Next.js application that validates Atlassian Marketplace transactions to ensure:

- Pricing is correct based on user count and platform
- Manual discounts have proper explanations
- Partner cuts are calculated correctly (for specific products)

## Features

- **Automated Price Validation**: Fetches current pricing from marketplace listings and compares against transaction amounts
- **Discount Verification**: Ensures all manual discounts have explanations
- **Partner Cut Validation**: Verifies partner commission calculations (20% for Table Grid Next Generation)
- **Multiple Report Formats**: Generate reports in HTML, JSON, or plain text
- **API-First Design**: Use via web UI or direct API calls
- **Vercel-Ready**: Optimized for deployment on Vercel

## Prerequisites

- Node.js 18.x or higher
- Atlassian Marketplace API credentials
- Your Developer/Space ID from Atlassian

## Getting Your Atlassian API Credentials

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/)
2. Navigate to your account settings
3. Generate an API token
4. Note your Developer ID (found in your developer profile)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mpwatcher
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```bash
ATLASSIAN_API_TOKEN=your_api_token_here
ATLASSIAN_DEVELOPER_ID=39811bd6-659c-4089-a14f-a016fbfec7d9
PARTNER_CUT_PERCENTAGE=20
```

## Local Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables:
```bash
vercel env add ATLASSIAN_API_TOKEN
vercel env add ATLASSIAN_DEVELOPER_ID
vercel env add PARTNER_CUT_PERCENTAGE
```

4. Redeploy with environment variables:
```bash
vercel --prod
```

### Option 2: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `ATLASSIAN_API_TOKEN`
   - `ATLASSIAN_DEVELOPER_ID`
   - `PARTNER_CUT_PERCENTAGE`
6. Click "Deploy"

## API Usage

### Validate Transactions

```bash
GET /api/validate?startDate=2024-01-01&endDate=2024-12-31&format=json
```

**Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `appKey` (optional): Specific app key to validate
- `format` (optional): Report format - `json`, `html`, or `text` (default: `json`)

**Example Response (JSON format):**
```json
{
  "success": true,
  "report": {
    "generatedAt": "2024-10-25T10:30:00.000Z",
    "totalTransactions": 150,
    "validTransactions": 142,
    "invalidTransactions": 8,
    "summary": {
      "priceIssues": 3,
      "discountIssues": 4,
      "partnerCutIssues": 1
    },
    "results": [...]
  }
}
```

### Health Check

```bash
GET /api/health
```

Returns API status and configuration check.

## How It Works

### 1. Price Validation

The validator:
- Fetches current pricing from marketplace listings
- Extracts the pricing tier and platform from each transaction
- Compares the charged amount against expected pricing
- Accounts for discounts and rounding differences

### 2. Discount Validation

For each transaction with discounts:
- Identifies manual/custom discounts
- Checks if an explanation/reason is provided
- Validates explanation quality (minimum length)

### 3. Partner Cut Validation

For Table Grid Next Generation transactions:
- Verifies partner commission is calculated correctly
- Checks if the partner cut matches the configured percentage (default 20%)
- Flags any discrepancies

## Validation Rules

### Price Checks
- ✓ Price matches the marketplace listing for the given tier and platform
- ✓ Discounts are properly applied
- ⚠️ Allows ±$0.02 tolerance for rounding differences

### Discount Checks
- ✓ All manual discounts have explanations
- ✓ Explanations are at least 10 characters
- ⚠️ Warning if explanation is too brief

### Partner Cut Checks
- ✓ Partner commission is exactly 20% (configurable) of vendor amount
- ✓ Only applies to Table Grid Next Generation
- ⚠️ Allows ±$0.02 tolerance for rounding differences

## Project Structure

```
mpwatcher/
├── lib/
│   ├── atlassian-api.ts      # Atlassian API client
│   ├── pricing-fetcher.ts    # Marketplace pricing scraper
│   ├── validator.ts           # Transaction validation logic
│   └── report-generator.ts   # Report generation
├── pages/
│   ├── api/
│   │   ├── validate.ts       # Main validation endpoint
│   │   └── health.ts         # Health check endpoint
│   ├── _app.tsx
│   └── index.tsx             # Web UI
├── types/
│   └── index.ts              # TypeScript types
├── package.json
├── tsconfig.json
└── next.config.js
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ATLASSIAN_API_TOKEN` | Your Atlassian API token | Yes | - |
| `ATLASSIAN_DEVELOPER_ID` | Your developer/space ID | Yes | - |
| `PARTNER_CUT_PERCENTAGE` | Partner commission % | No | 20 |
| `APP_KEYS` | Comma-separated app keys to validate | No | All apps |

## Troubleshooting

### "Missing required environment variables"
- Ensure `ATLASSIAN_API_TOKEN` and `ATLASSIAN_DEVELOPER_ID` are set in your `.env` file or Vercel environment variables

### "Could not fetch pricing information"
- The marketplace listing page structure may have changed
- Check if the app key is correct
- Verify the app is publicly listed on the marketplace

### "No transactions found"
- Check your API token has the correct permissions
- Verify your developer ID is correct
- Ensure there are transactions in the specified date range

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
