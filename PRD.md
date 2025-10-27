# Product Requirements Document
## Marketplace Transaction Validator (MPWatcher)

**Version:** 1.0
**Last Updated:** October 27, 2025
**Document Owner:** Product Team
**Status:** Active Development

---

## 1. Executive Summary

### 1.1 Product Vision
MPWatcher is a web-based validation and auditing tool that ensures financial compliance for Atlassian Marketplace transactions. It automates the verification of pricing accuracy, discount documentation, and partner commission calculations, reducing manual audit time from hours to minutes.

### 1.2 Business Problem
Atlassian app vendors face challenges in:
- Manually validating hundreds of marketplace transactions for pricing accuracy
- Ensuring all discounts are properly documented for financial audits
- Verifying partner revenue share calculations comply with contractual agreements
- Generating audit reports for finance and legal teams

### 1.3 Solution Overview
A Next.js application that:
- Connects to Atlassian Marketplace API to fetch transaction data
- Scrapes current marketplace pricing for validation
- Automatically validates transactions against three criteria: price accuracy, discount documentation, and partner commission
- Generates multi-format reports (HTML, JSON, text) for various stakeholders

### 1.4 Success Criteria
- Reduce transaction validation time by 90%
- Achieve 99% accuracy in price validation
- Generate audit-ready reports in under 30 seconds
- Support batch validation of 500+ transactions
- Zero credential exposure in logs or version control

---

## 2. Product Overview

### 2.1 Product Description
MPWatcher is a compliance automation tool designed for Atlassian Marketplace app vendors. It provides both a web interface and RESTful API for validating transaction integrity against marketplace pricing, discount policies, and partner agreements.

### 2.2 Target Market
- Atlassian Marketplace app vendors
- Finance teams requiring transaction audits
- Partnership managers tracking revenue share
- Legal/compliance teams needing audit trails

### 2.3 Core Value Propositions
1. **Automated Compliance**: Eliminates manual transaction review
2. **Multi-Format Reporting**: Serves technical and non-technical stakeholders
3. **Real-Time Validation**: Immediate feedback on transaction issues
4. **Audit Trail**: Generate reports for regulatory compliance
5. **Partner Transparency**: Verify commission calculations automatically

---

## 3. Objectives & Goals

### 3.1 Primary Objectives
- **Q1 2025**: Launch MVP with price validation and basic reporting
- **Q2 2025**: Add discount verification and partner cut validation
- **Q3 2025**: Implement automated scheduling and alerts
- **Q4 2025**: Add historical trending and analytics dashboard

### 3.2 Key Results (KRs)
- Validate 10,000+ transactions per month
- Support 5+ Atlassian app vendors
- Achieve <1% false positive rate in validations
- Generate 100+ audit reports monthly
- Maintain 99.9% API uptime

### 3.3 Non-Goals (Out of Scope for V1)
- Direct transaction modification in Atlassian systems
- User authentication/multi-tenancy (single vendor per deployment)
- Historical data storage (stateless validation)
- Automated refund processing
- Integration with accounting software (QuickBooks, Xero)

---

## 4. User Personas

### 4.1 Primary Persona: Sarah (Finance Manager)
**Background**: Manages financial reporting for Atlassian app portfolio
**Goals**:
- Ensure all transactions match marketplace pricing
- Document discount explanations for audits
- Generate monthly compliance reports for CFO

**Pain Points**:
- Manually reviewing 200+ transactions per month
- Identifying pricing discrepancies across multiple apps
- Tracking down missing discount documentation

**User Stories**:
- "As Sarah, I want to validate all transactions for the past month so I can generate an audit report for the CFO"
- "As Sarah, I want to identify transactions with missing discount explanations so I can follow up with sales"

### 4.2 Secondary Persona: Mike (Partnership Manager)
**Background**: Manages partner relationships for Table Grid app
**Goals**:
- Verify partner commission calculations are accurate
- Identify commission discrepancies before partner invoicing
- Maintain trust with partner organizations

**Pain Points**:
- Manual spreadsheet calculations prone to errors
- Delayed identification of commission issues
- Difficult to explain discrepancies to partners

**User Stories**:
- "As Mike, I want to validate partner commissions for Table Grid so I can invoice partners accurately"
- "As Mike, I want to receive alerts for commission discrepancies so I can resolve them before partner notices"

### 4.3 Tertiary Persona: Dev (Backend Engineer)
**Background**: Maintains automation pipelines and integrations
**Goals**:
- Integrate validation into CI/CD workflows
- Automate monthly compliance reporting
- Monitor transaction health via APIs

**Pain Points**:
- No programmatic access to validation logic
- Manual report generation interrupts workflows
- Lack of alerting for critical issues

**User Stories**:
- "As Dev, I want to call the validation API from cron jobs so I can automate monthly reports"
- "As Dev, I want JSON output so I can integrate with our alerting system"

---

## 5. Functional Requirements

### 5.1 Transaction Fetching
**FR-1.1**: System shall fetch transactions from Atlassian Marketplace API using Basic Authentication
**FR-1.2**: System shall support filtering by date range (startDate, endDate)
**FR-1.3**: System shall support filtering by specific app key (addonKey)
**FR-1.4**: System shall handle API pagination automatically
**FR-1.5**: System shall extract discount details from transaction responses

**Acceptance Criteria**:
- API calls complete within 30 seconds
- Support date ranges up to 12 months
- Handle up to 500 transactions per request
- Extract both automatic and manual discounts
- Gracefully handle API rate limits

### 5.2 Price Validation
**FR-2.1**: System shall scrape current marketplace pricing for each app
**FR-2.2**: System shall support Cloud, Server, and Data Center platforms
**FR-2.3**: System shall match transaction prices against current tier pricing
**FR-2.4**: System shall allow $0.02 tolerance for rounding differences
**FR-2.5**: System shall account for applied discounts when validating prices
**FR-2.6**: System shall cache pricing data to minimize scraping requests

**Acceptance Criteria**:
- Scrape pricing within 15 seconds per app/platform
- Correctly parse pricing tables with varied HTML structures
- Handle currency symbols ($, €, £)
- Normalize user count tiers (e.g., "10 users" → "1-10")
- Identify price mismatches with <$0.02 accuracy

### 5.3 Discount Verification
**FR-3.1**: System shall identify manual/custom discounts in transactions
**FR-3.2**: System shall require minimum 10-character explanation for manual discounts
**FR-3.3**: System shall warn if explanations are between 10-25 characters (too brief)
**FR-3.4**: System shall distinguish between automatic and manual discounts
**FR-3.5**: System shall flag transactions with unexplained manual discounts as errors

**Acceptance Criteria**:
- Detect manual discounts with 100% accuracy
- Character count excludes leading/trailing whitespace
- Warning severity for brief explanations (not error)
- Error severity for missing/empty explanations
- List specific discount details in validation issues

### 5.4 Partner Commission Validation
**FR-4.1**: System shall validate partner cut percentage for specified apps (e.g., Table Grid)
**FR-4.2**: System shall support configurable partner cut percentage via environment variable
**FR-4.3**: System shall calculate expected partner amount as: vendorAmount × (partnerCutPercentage / 100)
**FR-4.4**: System shall allow $0.02 tolerance for rounding differences
**FR-4.5**: System shall only validate transactions that include partner details

**Acceptance Criteria**:
- Default partner cut: 20%
- Support partner cuts from 0% to 100%
- Flag discrepancies >$0.02 as errors
- Skip validation if partnerDetails missing
- Include expected vs actual amounts in error details

### 5.5 Report Generation
**FR-5.1**: System shall generate reports in three formats: HTML, JSON, text
**FR-5.2**: HTML reports shall include styled summary cards and transaction tables
**FR-5.3**: JSON reports shall follow structured schema for programmatic parsing
**FR-5.4**: Text reports shall be human-readable for email/terminal display
**FR-5.5**: All reports shall include timestamp, totals, and issue breakdown
**FR-5.6**: Reports shall categorize issues by severity (error, warning, info)

**Acceptance Criteria**:
- HTML reports render correctly in Chrome, Firefox, Safari
- JSON reports validate against defined TypeScript interface
- Text reports use fixed-width formatting for alignment
- All formats include: generatedAt, totalTransactions, validTransactions, invalidTransactions
- Issue counts separated by type: priceIssues, discountIssues, partnerCutIssues

### 5.6 API Endpoints
**FR-6.1**: System shall provide GET /api/validate endpoint with query parameters
**FR-6.2**: System shall provide POST /api/validate endpoint with JSON body
**FR-6.3**: System shall provide GET /api/health endpoint for status checks
**FR-6.4**: API shall return appropriate HTTP status codes (200, 405, 500)
**FR-6.5**: API shall support Content-Type negotiation (application/json, text/html, text/plain)

**Acceptance Criteria**:
- GET /api/validate accepts: startDate, endDate, appKey, format
- POST /api/validate accepts same parameters in JSON body
- /api/health returns config status without executing validation
- Invalid methods return 405 Method Not Allowed
- Missing env vars return 500 with descriptive error

### 5.7 Web User Interface
**FR-7.1**: System shall provide web form for date range input (optional fields)
**FR-7.2**: System shall provide dropdown for report format selection
**FR-7.3**: System shall display loading state during validation
**FR-7.4**: System shall display error messages for failed requests
**FR-7.5**: System shall open HTML reports in new browser window
**FR-7.6**: System shall trigger file downloads for JSON/text reports
**FR-7.7**: System shall display API usage documentation on homepage

**Acceptance Criteria**:
- Date inputs use HTML5 date picker
- Format dropdown defaults to HTML
- Loading button shows "Validating..." text
- Errors display in red box above button
- HTML reports open via window.open()
- Downloads use Blob API with correct MIME types
- API docs include example curl commands

---

## 6. Technical Requirements

### 6.1 Technology Stack

#### 6.1.1 Frontend Framework
**Requirement**: Next.js 14.2.0 or higher
**Rationale**: Full-stack framework with built-in API routes, server-side rendering, and Vercel deployment optimization

**Dependencies**:
- react: 18.3.0
- react-dom: 18.3.0
- next: 14.2.0

#### 6.1.2 Programming Language
**Requirement**: TypeScript 5.3.0 or higher
**Rationale**: Type safety reduces runtime errors, improves developer experience, and enables better IDE support

**TypeScript Configuration**:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

#### 6.1.3 HTTP Client
**Requirement**: axios 1.6.0 or higher
**Rationale**: Promise-based HTTP client with built-in auth support, timeout configuration, and automatic JSON parsing

**Configuration**:
- Timeout: 30 seconds for API calls
- Basic Auth: username (email) + password (API token)
- Headers: Accept: application/json

#### 6.1.4 HTML Parser
**Requirement**: cheerio 1.0.0 or higher
**Rationale**: Fast, lightweight HTML parsing without headless browser overhead (vs Puppeteer/Playwright)

**Use Cases**:
- Parse marketplace pricing tables
- Extract pricing tier data
- Handle varied HTML structures across platforms

#### 6.1.5 Date Utilities
**Requirement**: date-fns 3.0.0 or higher
**Rationale**: Modular date formatting library with tree-shaking support (smaller bundle than moment.js)

**Functions Used**:
- format(): ISO timestamp to readable dates
- parseISO(): String to Date object conversion

### 6.2 Architecture Pattern

#### 6.2.1 Service Layer Architecture
**Structure**:
```
Presentation Layer (pages/index.tsx)
        ↓
API Layer (pages/api/validate.ts)
        ↓
Service Layer (lib/*.ts)
        ├── AtlassianMarketplaceAPI
        ├── PricingFetcher
        ├── TransactionValidator
        └── ReportGenerator
```

**Principles**:
- Single Responsibility: Each service handles one domain
- Dependency Injection: Services accept config in constructors
- Stateless Design: No shared mutable state between requests
- Factory Pattern: Services instantiated per request

#### 6.2.2 Module Organization
**lib/atlassian-api.ts**:
- Responsibility: External API communication
- Exports: AtlassianMarketplaceAPI class
- Dependencies: axios

**lib/pricing-fetcher.ts**:
- Responsibility: Marketplace price scraping
- Exports: PricingFetcher class
- Dependencies: axios, cheerio
- Caching: In-memory Map (per-instance)

**lib/validator.ts**:
- Responsibility: Transaction validation logic
- Exports: TransactionValidator class
- Dependencies: PricingFetcher
- Methods: validateTransactions(), validateTransaction()

**lib/report-generator.ts**:
- Responsibility: Report formatting
- Exports: ReportGenerator class
- Dependencies: date-fns
- Methods: generateReport(), generateHTMLReport(), generateJSONReport(), generateTextReport()

**types/index.ts**:
- Exports: TypeScript interfaces for all data models
- No runtime code, pure type definitions

### 6.3 Data Flow Architecture

```
User Request
    ↓
Next.js API Route (/api/validate)
    ↓
[1] AtlassianMarketplaceAPI.getTransactions()
    ↓ (HTTP GET to Atlassian API)
Transaction[]
    ↓
[2] TransactionValidator.validateTransactions()
    ├→ For each transaction:
    │  ├→ [3] PricingFetcher.getAppPricing()
    │  │      ↓ (HTTP GET + Cheerio parse)
    │  │   AppPricing (cached)
    │  ├→ validatePrice()
    │  ├→ validateDiscounts()
    │  └→ validatePartnerCut()
    └→ TransactionValidationResult[]
    ↓
[4] ReportGenerator.generateReport()
    ↓
ValidationReport
    ↓
[5] ReportGenerator.generate[HTML|JSON|Text]Report()
    ↓
Response (Content-Type based on format)
```

### 6.4 Environment Configuration

#### 6.4.1 Required Environment Variables
```bash
# Atlassian API Credentials
ATLASSIAN_EMAIL=vendor@example.com
ATLASSIAN_API_TOKEN=abc123...xyz
ATLASSIAN_DEVELOPER_ID=39811bd6-659c-4089-a14f-a016fbfec7d9

# Optional Configuration
PARTNER_CUT_PERCENTAGE=20        # Default: 20
APP_KEYS=com.app1,com.app2       # Default: all apps
```

#### 6.4.2 Configuration Loading
- Local Development: `.env.local` (loaded by Next.js)
- Production: Vercel environment variables (injected at runtime)
- Validation: Health endpoint checks all required vars exist

### 6.5 Build and Deployment

#### 6.5.1 Build Process
```bash
# Development
npm install          # Install dependencies
npm run dev         # Start dev server (localhost:3000)

# Production Build
npm run build       # Next.js build to .next/
npm start          # Start production server

# Linting
npm run lint       # ESLint via Next.js
```

#### 6.5.2 Build Outputs
- `.next/`: Compiled Next.js pages and API routes
- `.next/static/`: Static assets (CSS, JS bundles)
- `.next/server/`: Server-side code for API routes
- Build Size: ~2-5MB (optimized)
- Build Time: 30-60 seconds

#### 6.5.3 Runtime Requirements
- Node.js: 18.0.0+ (specified in .nvmrc)
- Memory: 256MB minimum (HTML parsing overhead)
- CPU: Single core sufficient (I/O-bound workload)
- Disk: 100MB (includes node_modules)

---

## 7. Non-Functional Requirements

### 7.1 Performance

**NFR-1.1 API Response Time**
- Target: <30 seconds for validation of 100 transactions
- Maximum: 60 seconds (Vercel function timeout)
- Baseline: 2 seconds per transaction (including price scraping)

**NFR-1.2 Throughput**
- Support: 500 transactions per validation request
- Concurrency: 1 request at a time per instance (stateless scaling)
- Rate Limit: Governed by Atlassian API limits

**NFR-1.3 Caching**
- Price Cache: In-memory per request (cleared after response)
- Cache Hit Rate: >80% for repeated app validations
- Cache Invalidation: None (pricing data considered static per request)

### 7.2 Reliability

**NFR-2.1 Uptime**
- Target: 99.9% uptime (Vercel SLA)
- Monitoring: Health endpoint (/api/health)
- Failover: Handled by Vercel platform

**NFR-2.2 Error Handling**
- API Timeout: 30 seconds with descriptive error message
- Network Retry: 3 retries with exponential backoff
- Graceful Degradation: Continue validation if single app pricing fails

**NFR-2.3 Data Integrity**
- Validation Accuracy: 99%+ (within $0.02 tolerance)
- False Positive Rate: <1%
- No data mutation: Read-only operations

### 7.3 Scalability

**NFR-3.1 Horizontal Scaling**
- Deployment: Serverless functions (auto-scaling)
- Stateless: No shared state between instances
- Database: None (in-memory only)

**NFR-3.2 Vertical Scaling**
- Memory: Linear growth with transaction count (~1MB per 100 transactions)
- CPU: Constant (I/O-bound, not CPU-bound)

**NFR-3.3 Transaction Limits**
- Soft Limit: 500 transactions per request
- Hard Limit: Vercel function memory limit (~1GB)
- Recommendation: Paginate requests for >500 transactions

### 7.4 Usability

**NFR-4.1 User Interface**
- Load Time: <2 seconds (homepage)
- Mobile Responsive: Desktop-optimized (tablet/mobile not primary)
- Accessibility: WCAG 2.1 Level A minimum

**NFR-4.2 API Usability**
- Documentation: Inline on homepage + README
- Error Messages: Descriptive with resolution steps
- Versioning: None (single version, breaking changes avoided)

**NFR-4.3 Learning Curve**
- New User Onboarding: <5 minutes (form-based UI)
- API Integration: <30 minutes (curl examples provided)

### 7.5 Maintainability

**NFR-5.1 Code Quality**
- TypeScript Coverage: 100% (strict mode)
- Linting: ESLint with Next.js config
- Code Comments: Inline for complex logic

**NFR-5.2 Testing**
- Unit Tests: None (V1, add in V2)
- Integration Tests: Manual (API endpoint testing)
- E2E Tests: None (V1)

**NFR-5.3 Monitoring**
- Logging: Console logs (captured by Vercel)
- Metrics: Vercel Analytics (function duration, invocation count)
- Alerts: None (V1, add in V2)

### 7.6 Security

**NFR-6.1 Authentication**
- API: Basic Auth to Atlassian (credentials in env vars)
- UI: No authentication (single-tenant deployment)

**NFR-6.2 Data Protection**
- Credentials: Environment variables only (not in code/logs)
- HTTPS: Enforced by Vercel
- PII: No long-term storage of transaction data

**NFR-6.3 Secrets Management**
- Development: .env.local (gitignored)
- Production: Vercel environment variables
- Rotation: Manual (Atlassian API token regeneration)

---

## 8. API Specifications

### 8.1 Endpoint: GET /api/validate

**Description**: Validates marketplace transactions and returns report

**URL**: `/api/validate`

**Method**: `GET`

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| startDate | string | No | Start date for transaction range (YYYY-MM-DD) | 2024-01-01 |
| endDate | string | No | End date for transaction range (YYYY-MM-DD) | 2024-12-31 |
| appKey | string | No | Specific app key to validate | com.example.myapp |
| format | string | No | Output format: json, html, text (default: json) | json |

**Request Example**:
```bash
curl "https://app.vercel.app/api/validate?startDate=2024-10-01&endDate=2024-10-31&format=json"
```

**Response (200 OK - JSON)**:
```json
{
  "success": true,
  "report": {
    "generatedAt": "2024-10-27T10:30:00.000Z",
    "totalTransactions": 150,
    "validTransactions": 142,
    "invalidTransactions": 8,
    "summary": {
      "priceIssues": 3,
      "discountIssues": 4,
      "partnerCutIssues": 1
    },
    "results": [
      {
        "transactionId": "TXN-12345",
        "addonKey": "com.example.myapp",
        "addonName": "My App",
        "saleDate": "2024-10-15",
        "isValid": false,
        "checks": {
          "priceCorrect": false,
          "discountExplained": true,
          "partnerCutCorrect": true
        },
        "issues": [
          {
            "severity": "error",
            "type": "price",
            "message": "Price does not match expected amount for tier",
            "details": {
              "expectedPrice": 100.00,
              "actualPrice": 98.00,
              "difference": -2.00,
              "tier": "11-25 users",
              "platform": "Cloud"
            }
          }
        ]
      }
    ]
  }
}
```

**Response (200 OK - HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Validation Report</title>
  <style>/* Embedded CSS */</style>
</head>
<body>
  <h1>Marketplace Transaction Validation Report</h1>
  <div class="summary-cards">
    <!-- Summary statistics -->
  </div>
  <table>
    <!-- Transaction details -->
  </table>
</body>
</html>
```

**Response (200 OK - Text)**:
```
============================================================
MARKETPLACE TRANSACTION VALIDATION REPORT
============================================================
Generated: October 27, 2024 at 10:30 AM

SUMMARY
------------------------------------------------------------
Total Transactions: 150
Valid:              142
Invalid:            8
...
```

**Error Responses**:
```json
// 405 Method Not Allowed
{
  "success": false,
  "error": "Method not allowed"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Missing required environment variable: ATLASSIAN_EMAIL"
}
```

### 8.2 Endpoint: POST /api/validate

**Description**: Same as GET but accepts parameters in request body

**URL**: `/api/validate`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "startDate": "2024-10-01",
  "endDate": "2024-10-31",
  "appKey": "com.example.myapp",
  "format": "json"
}
```

**Responses**: Same as GET endpoint

### 8.3 Endpoint: GET /api/health

**Description**: Health check for API and configuration status

**URL**: `/api/health`

**Method**: `GET`

**Query Parameters**: None

**Request Example**:
```bash
curl "https://app.vercel.app/api/health"
```

**Response (200 OK)**:
```json
{
  "status": "ok",
  "timestamp": "2024-10-27T10:30:00.000Z",
  "config": {
    "hasEmail": true,
    "hasApiToken": true,
    "hasDeveloperId": true,
    "partnerCutPercentage": 20
  }
}
```

---

## 9. User Interface Requirements

### 9.1 Homepage Layout

**URL**: `/` (root path)

**Layout Structure**:
```
┌────────────────────────────────────────────────────────┐
│                      HEADER                             │
│  🔷 Marketplace Transaction Validator                  │
│  Validate Atlassian Marketplace transactions for       │
│  pricing accuracy, discount compliance, and partner    │
│  commission calculations.                               │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   VALIDATION FORM                       │
│                                                         │
│  Start Date (optional)                                 │
│  ┌─────────────────────────┐                          │
│  │ [Date Picker: YYYY-MM-DD]│                          │
│  └─────────────────────────┘                          │
│                                                         │
│  End Date (optional)                                   │
│  ┌─────────────────────────┐                          │
│  │ [Date Picker: YYYY-MM-DD]│                          │
│  └─────────────────────────┘                          │
│                                                         │
│  Report Format                                         │
│  ┌──────────────────────────┐                         │
│  │ HTML (View in Browser) ▼ │                         │
│  │ - HTML (View in Browser) │                         │
│  │ - JSON (Download)        │                         │
│  │ - Text (Download)        │                         │
│  └──────────────────────────┘                         │
│                                                         │
│  [❌ Error: Message here - if error occurs]           │
│                                                         │
│  ┌────────────────────────┐                           │
│  │  Validate Transactions  │  ← Button                │
│  └────────────────────────┘                           │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   API DOCUMENTATION                     │
│                                                         │
│  API Usage                                             │
│  You can also call the validation API directly:       │
│                                                         │
│  GET /api/validate?startDate=...&endDate=...&format=...│
│                                                         │
│  Example:                                              │
│  curl "https://[domain]/api/validate?format=json"     │
│                                                         │
│  Check API health:                                     │
│  GET /api/health                                       │
└────────────────────────────────────────────────────────┘
```

### 9.2 Visual Design Specifications

**Color Palette**:
- Background Gradient: `linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)`
- Card Background: `#ffffff`
- Primary Blue (Atlassian Brand): `#0052CC`
- Success Green: `#00875A`
- Error Red: `#DE350B`
- Warning Orange: `#FF991F`
- Text Primary: `#172B4D`
- Text Secondary: `#6B778C`
- Border: `#DFE1E6`

**Typography**:
- Font Family: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Heading (h1): 32px, bold, #172B4D
- Subheading (h2): 24px, semi-bold, #172B4D
- Body: 16px, normal, #172B4D
- Label: 14px, medium, #6B778C
- Code: `'Courier New', monospace`

**Spacing**:
- Container Max Width: 800px
- Container Padding: 40px
- Card Padding: 32px
- Input Spacing: 20px (between fields)
- Button Height: 48px
- Border Radius: 8px (cards), 4px (inputs/buttons)

**Shadows**:
- Card: `0 2px 8px rgba(0, 0, 0, 0.1)`
- Button Hover: `0 4px 12px rgba(0, 82, 204, 0.2)`

### 9.3 Interactive Elements

**Date Inputs**:
- Type: HTML5 date picker (`<input type="date">`)
- Placeholder: None (native date picker handles display)
- Validation: None (optional fields)
- Behavior: Opens native OS date picker on click

**Format Dropdown**:
- Type: `<select>` element
- Options:
  - HTML (View in Browser) [default]
  - JSON (Download)
  - Text (Download)
- Behavior: Standard dropdown, no custom styling

**Validate Button**:
- Default State: "Validate Transactions" (blue background)
- Loading State: "Validating..." (disabled, gray background)
- Hover State: Darker blue + shadow
- Click: Triggers form submission

**Error Box**:
- Display: Conditionally shown (only when error exists)
- Style: Red background (#FFEBE6), red text (#DE350B)
- Content: Error message from API or network error
- Dismissal: Disappears on successful submission

### 9.4 Responsive Behavior

**Desktop (>768px)**:
- Container: 800px max-width, centered
- Layout: Single column
- Form: Full-width inputs

**Tablet (480px - 768px)**:
- Container: 90% width
- Layout: Single column
- Form: Full-width inputs

**Mobile (<480px)**:
- Container: 95% width
- Padding: Reduced to 20px
- Font Sizes: Slightly smaller (h1: 28px)

---

## 10. Data Models

### 10.1 TypeScript Interfaces

#### AtlassianTransaction
```typescript
interface AtlassianTransaction {
  transactionId: string;
  addonKey: string;
  addonName: string;
  saleDate: string;                    // ISO 8601 date string
  billingPeriod: string;               // "Monthly", "Annual"
  licenseTier: string;                 // "1-10 users", "11-25 users"
  platform: string;                    // "Cloud", "Server", "Data Center"
  vendorAmount: number;                // Vendor revenue (after commissions)
  totalAmountCharged: number;          // Total price paid by customer
  partnerDiscountAmount?: number;      // Partner discount if applicable
  customerDetails?: {
    country?: string;
    region?: string;
  };
  discounts?: Array<{
    type: string;                      // "automatic", "manual"
    amount: number;
    explanation?: string;
  }>;
  partnerDetails?: {
    partnerName: string;
    partnerAmount: number;             // Commission paid to partner
  };
}
```

#### PricingTier
```typescript
interface PricingTier {
  userCount: string;                   // "1-10", "11-25", "26-50", etc.
  price: number;                       // Numeric price (USD)
  platform: string;                    // "Cloud", "Server", "Data Center"
}
```

#### AppPricing
```typescript
interface AppPricing {
  appKey: string;                      // "com.example.myapp"
  appName: string;
  tiers: PricingTier[];                // Array of pricing tiers
  fetchedAt: Date;                     // Cache timestamp
}
```

#### ValidationIssue
```typescript
interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  type: 'price' | 'discount' | 'partner_cut';
  message: string;                     // Human-readable description
  details: Record<string, any>;        // Structured details (expected vs actual)
}
```

#### TransactionValidationResult
```typescript
interface TransactionValidationResult {
  transactionId: string;
  addonKey: string;
  addonName: string;
  saleDate: string;
  isValid: boolean;                    // Overall validity (no errors)
  checks: {
    priceCorrect: boolean;
    discountExplained: boolean;
    partnerCutCorrect: boolean;
  };
  issues: ValidationIssue[];           // Array of found issues
}
```

#### ValidationReport
```typescript
interface ValidationReport {
  generatedAt: string;                 // ISO 8601 timestamp
  totalTransactions: number;
  validTransactions: number;
  invalidTransactions: number;
  summary: {
    priceIssues: number;
    discountIssues: number;
    partnerCutIssues: number;
  };
  results: TransactionValidationResult[];
}
```

#### AtlassianAPIConfig
```typescript
interface AtlassianAPIConfig {
  email: string;                       // Atlassian account email
  apiToken: string;                    // API token from id.atlassian.com
  developerId: string;                 // Developer space ID
}
```

### 10.2 Validation Rules

#### Price Validation Logic
```typescript
// Expected price calculation
const expectedPrice = getTierPrice(transaction.licenseTier, transaction.platform);
const discountAmount = transaction.discounts?.reduce((sum, d) => sum + d.amount, 0) || 0;
const expectedTotal = expectedPrice - discountAmount;

// Validation with tolerance
const actualPrice = transaction.totalAmountCharged;
const difference = Math.abs(actualPrice - expectedTotal);
const tolerance = 0.02;

if (difference > tolerance) {
  // Flag as price issue
  issue = {
    severity: 'error',
    type: 'price',
    message: 'Price does not match expected amount for tier',
    details: {
      expectedPrice,
      actualPrice,
      difference: actualPrice - expectedTotal,
      tier: transaction.licenseTier,
      platform: transaction.platform
    }
  };
}
```

#### Discount Validation Logic
```typescript
const manualDiscounts = transaction.discounts?.filter(d =>
  d.type === 'manual' || d.type === 'custom'
) || [];

for (const discount of manualDiscounts) {
  const explanation = discount.explanation?.trim() || '';

  if (explanation.length === 0) {
    // Error: Missing explanation
    issue = {
      severity: 'error',
      type: 'discount',
      message: 'Manual discount missing explanation',
      details: { discountAmount: discount.amount }
    };
  } else if (explanation.length < 10) {
    // Error: Too short
    issue = {
      severity: 'error',
      type: 'discount',
      message: 'Manual discount explanation too short (minimum 10 characters)',
      details: { explanation, length: explanation.length }
    };
  } else if (explanation.length < 25) {
    // Warning: Brief
    issue = {
      severity: 'warning',
      type: 'discount',
      message: 'Manual discount explanation is brief',
      details: { explanation, length: explanation.length }
    };
  }
}
```

#### Partner Cut Validation Logic
```typescript
// Only for specific apps (e.g., Table Grid)
const targetAppKeys = ['com.example.tablegrid'];
if (!targetAppKeys.includes(transaction.addonKey)) {
  return; // Skip validation
}

if (!transaction.partnerDetails) {
  return; // No partner details to validate
}

const partnerCutPercentage = parseFloat(process.env.PARTNER_CUT_PERCENTAGE || '20');
const expectedPartnerAmount = transaction.vendorAmount * (partnerCutPercentage / 100);
const actualPartnerAmount = transaction.partnerDetails.partnerAmount;
const difference = Math.abs(actualPartnerAmount - expectedPartnerAmount);
const tolerance = 0.02;

if (difference > tolerance) {
  issue = {
    severity: 'error',
    type: 'partner_cut',
    message: 'Partner cut amount does not match expected percentage',
    details: {
      expectedAmount: expectedPartnerAmount,
      actualAmount: actualPartnerAmount,
      difference: actualPartnerAmount - expectedPartnerAmount,
      expectedPercentage: partnerCutPercentage,
      vendorAmount: transaction.vendorAmount
    }
  };
}
```

---

## 11. Security Requirements

### 11.1 Authentication & Authorization

**SEC-1.1 Atlassian API Authentication**
- Method: HTTP Basic Authentication
- Credentials: Email + API Token (not OAuth)
- Token Generation: https://id.atlassian.com/manage-profile/security/api-tokens
- Token Scope: Read-only access to marketplace transactions

**SEC-1.2 Application Authentication**
- V1: No authentication (single-tenant deployment)
- V2: Add basic auth for web UI (username/password)
- V3: OAuth or SSO for enterprise deployments

### 11.2 Credential Management

**SEC-2.1 Environment Variable Security**
- Storage: .env.local (development), Vercel env vars (production)
- Exclusion: .env and .env.local in .gitignore
- Templates: .env.example and .env.local.example (no actual values)
- Access: Server-side only (never exposed to client)

**SEC-2.2 Secrets in Logs**
- Logging: Avoid logging credentials or tokens
- Error Messages: Sanitize stack traces (no env var values)
- Vercel Logs: Automatically mask environment variables

**SEC-2.3 Token Rotation**
- Frequency: Every 90 days (recommended)
- Process: Regenerate in Atlassian console → update env vars
- Revocation: Immediate via Atlassian security settings

### 11.3 Data Protection

**SEC-3.1 Data in Transit**
- Protocol: HTTPS only (enforced by Vercel)
- TLS Version: 1.2 minimum
- Certificates: Managed by Vercel (auto-renewal)

**SEC-3.2 Data at Rest**
- Storage: None (stateless application)
- Caching: In-memory only (cleared after request)
- No persistence: No database, files, or logs with transaction data

**SEC-3.3 PII Handling**
- Customer Data: Minimal (country, region only)
- Retention: None (not stored beyond request lifecycle)
- Compliance: No GDPR/CCPA requirements (no persistent storage)

### 11.4 Network Security

**SEC-4.1 Outbound Requests**
- Allowed Domains: api.atlassian.com, marketplace.atlassian.com
- Timeout: 30 seconds (prevents hung connections)
- User Agent: Custom (identifies application)

**SEC-4.2 CORS Configuration**
- Policy: Same-origin only (API routes accessed from same domain)
- Headers: None (Next.js defaults)

**SEC-4.3 Rate Limiting**
- Application: None (single-tenant, trusted users)
- Upstream: Governed by Atlassian API limits
- Recommendation: Add rate limiting in V2 for multi-tenant

### 11.5 Dependency Security

**SEC-5.1 Package Management**
- Lock File: package-lock.json (versioned)
- Audit: npm audit (manual, should be automated in CI)
- Updates: Manual (should move to Dependabot in V2)

**SEC-5.2 Known Vulnerabilities**
- Scanning: None (V1)
- Recommendation: Add Snyk or GitHub Security scanning in V2

### 11.6 Compliance

**SEC-6.1 Standards**
- OWASP Top 10: Address injection, auth, sensitive data exposure
- SOC 2: Inherited from Vercel platform
- GDPR: Not applicable (no EU user data stored)

**SEC-6.2 Audit Trail**
- Validation Runs: Not logged (V1)
- Recommendation: Add audit logging in V2 (who ran what when)

---

## 12. Deployment Requirements

### 12.1 Deployment Platform: Vercel

**Platform Choice Rationale**:
- Native Next.js support with zero configuration
- Automatic HTTPS and CDN
- Serverless functions for API routes
- Git-based deployment (auto-deploy on push)
- Environment variable management
- Free tier suitable for low-volume usage

**Vercel Configuration** (vercel.json):
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "regions": ["iad1"]
}
```

### 12.2 Deployment Workflow

#### 12.2.1 Initial Setup
1. Create Vercel account at https://vercel.com
2. Connect GitHub repository
3. Import project (auto-detects Next.js)
4. Configure environment variables:
   - ATLASSIAN_EMAIL
   - ATLASSIAN_API_TOKEN
   - ATLASSIAN_DEVELOPER_ID
   - PARTNER_CUT_PERCENTAGE (optional)
5. Deploy (automatic on import)

#### 12.2.2 Continuous Deployment
```
Git Push to main/master
    ↓
Vercel detects commit
    ↓
Trigger build:
  - npm install
  - npm run build
  - Generate .next/ directory
    ↓
Deploy to production:
  - Upload static assets to CDN
  - Deploy serverless functions
  - Update DNS/routing
    ↓
Production URL active
  - https://[project-name].vercel.app
  - Custom domain (if configured)
```

#### 12.2.3 Preview Deployments
- Branch Deployments: Every PR gets preview URL
- Preview Environment: Separate env vars possible
- Testing: Test changes before merging to production

### 12.3 Environment Configuration

#### 12.3.1 Development Environment
```bash
# .env.local (not versioned)
ATLASSIAN_EMAIL=dev@example.com
ATLASSIAN_API_TOKEN=dev-token-here
ATLASSIAN_DEVELOPER_ID=dev-id-here
PARTNER_CUT_PERCENTAGE=20
```

#### 12.3.2 Production Environment
Set in Vercel Dashboard:
- Project Settings → Environment Variables
- Scope: Production, Preview, Development
- Masked in UI (secure)

### 12.4 Build Configuration

**package.json scripts**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Build Steps**:
1. Install dependencies: `npm install` (uses package-lock.json)
2. Run linter: `npm run lint` (optional, not blocking)
3. Build Next.js: `npm run build`
   - Compiles TypeScript
   - Bundles client/server code
   - Generates static pages
   - Optimizes images/assets
4. Output: `.next/` directory

**Build Time**:
- Cold Build: 60-90 seconds (first deployment)
- Incremental: 30-45 seconds (cached node_modules)

### 12.5 Function Configuration

**Vercel Serverless Functions**:
- Timeout: 300 seconds (max for free tier, 10s default)
- Memory: 1024MB
- Region: US East 1 (iad1) - configurable
- Cold Start: <1 second

**Function Optimization**:
- Use Edge Functions for lower latency (future enhancement)
- Implement caching headers (future enhancement)
- Consider function splitting if >10MB

### 12.6 Monitoring & Logging

**Vercel Analytics**:
- Function Invocations: Count, duration, errors
- Bandwidth: Data transfer metrics
- Logs: Real-time function logs

**Access Logs**:
- Vercel Dashboard → Project → Logs
- Filter by function name (/api/validate, /api/health)
- Search by error status codes

**Alerting**:
- None (V1)
- Recommendation: Vercel Monitoring (paid) or external (DataDog, Sentry)

### 12.7 Rollback Strategy

**Instant Rollback**:
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Instant switch (no rebuild)

**Git Rollback**:
```bash
git revert <commit-hash>
git push origin main
# Vercel auto-deploys reverted version
```

### 12.8 Custom Domain Setup

**Configuration**:
1. Vercel Dashboard → Project → Settings → Domains
2. Add custom domain (e.g., mpwatcher.example.com)
3. Configure DNS:
   - A Record: Points to Vercel IP
   - CNAME: Points to cname.vercel-dns.com
4. SSL: Automatic (Let's Encrypt)

### 12.9 Alternative Deployment Options

#### 12.9.1 Self-Hosted (Node.js Server)
```bash
# Build
npm run build

# Start production server
npm start
# or
node .next/standalone/server.js

# Use PM2 for process management
pm2 start npm --name "mpwatcher" -- start
```

**Requirements**:
- Node.js 18+
- Reverse proxy (nginx/Apache)
- SSL certificate (certbot)
- Port: 3000 (default)

#### 12.9.2 Docker Container
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t mpwatcher .
docker run -p 3000:3000 \
  -e ATLASSIAN_EMAIL=... \
  -e ATLASSIAN_API_TOKEN=... \
  -e ATLASSIAN_DEVELOPER_ID=... \
  mpwatcher
```

#### 12.9.3 Other Platforms
- **Netlify**: Similar to Vercel (Next.js support)
- **AWS Amplify**: AWS-native serverless
- **Google Cloud Run**: Container-based serverless
- **Heroku**: Traditional PaaS (requires Procfile)

---

## 13. Success Metrics

### 13.1 Product Metrics

**Adoption Metrics**:
- Weekly Active Users (WAU): Target 10+ by Q2 2025
- API Calls per Month: Target 1,000+ by Q2 2025
- Transactions Validated per Month: Target 10,000+ by Q2 2025

**Engagement Metrics**:
- Average Validations per User: Target 20/month
- Report Format Distribution: Track HTML vs JSON vs Text usage
- Date Range Usage: Percentage using custom date filters

**Quality Metrics**:
- Validation Accuracy: >99% (measure against manual audits)
- False Positive Rate: <1%
- False Negative Rate: <0.5%

### 13.2 Performance Metrics

**Response Time**:
- P50: <15 seconds (50 transactions)
- P95: <30 seconds (100 transactions)
- P99: <45 seconds (200+ transactions)

**Availability**:
- Uptime: >99.9% (Vercel SLA)
- Error Rate: <1% of requests
- Success Rate: >99%

**Throughput**:
- Concurrent Requests: 5+ (serverless scaling)
- Max Transactions per Request: 500
- API Timeout Rate: <2%

### 13.3 Business Metrics

**Cost Efficiency**:
- Cost per Validation: Target <$0.01
- Vercel Monthly Cost: Target <$50
- ROI: 100x (compare to manual validation time)

**Time Savings**:
- Manual Validation Time: ~2 minutes/transaction
- Automated Validation Time: ~1 second/transaction
- Total Time Saved: Target 100+ hours/month

### 13.4 User Satisfaction

**Feedback Collection**:
- V1: None (single user/team)
- V2: Add in-app feedback form
- V3: NPS survey quarterly

**Usability**:
- Task Completion Rate: >95% (users successfully generate report)
- Error Recovery Rate: >90% (users resolve errors without support)
- Time to First Report: <2 minutes for new users

### 13.5 Compliance Metrics

**Audit Coverage**:
- Transactions Validated: Target 100% of monthly transactions
- Discount Documentation Rate: Track % with proper explanations
- Partner Cut Accuracy: Target 100% compliance

**Issue Detection**:
- Price Issues Found: Track monthly
- Discount Issues Found: Track monthly
- Partner Cut Issues Found: Track monthly
- Mean Time to Detection (MTTD): <24 hours (with daily runs)

---

## 14. Future Roadmap

### 14.1 Phase 1 - MVP (Q1 2025) ✅ COMPLETE
- [x] Core validation engine (price, discount, partner cut)
- [x] Atlassian API integration
- [x] Web scraping for marketplace pricing
- [x] Multi-format reports (HTML, JSON, text)
- [x] Web UI with date filtering
- [x] Health check endpoint
- [x] Vercel deployment

### 14.2 Phase 2 - Enhancements (Q2 2025)
- [ ] **Authentication**: Add basic auth for web UI
- [ ] **Scheduled Runs**: Cron job integration (Vercel Cron or external)
- [ ] **Email Reports**: Send reports via email (SendGrid/SES)
- [ ] **Webhook Notifications**: Alert on validation failures
- [ ] **Historical Tracking**: Store validation results in database (PostgreSQL/MongoDB)
- [ ] **Audit Logging**: Track who ran what validation when
- [ ] **Unit Tests**: Jest/Vitest coverage for core logic
- [ ] **Error Monitoring**: Sentry integration for error tracking

### 14.3 Phase 3 - Analytics (Q3 2025)
- [ ] **Dashboard**: React-based analytics dashboard
- [ ] **Trends**: Chart issue trends over time (Chart.js/Recharts)
- [ ] **Comparative Analysis**: Month-over-month issue comparison
- [ ] **Drill-Down**: Filter by app, date range, issue type
- [ ] **Exports**: CSV/Excel export for external analysis
- [ ] **Alerts**: Configurable thresholds for automatic alerts
- [ ] **Compliance Score**: Overall compliance percentage per app

### 14.4 Phase 4 - Multi-Tenancy (Q4 2025)
- [ ] **User Management**: User accounts and roles
- [ ] **Multi-Vendor**: Support multiple developer spaces
- [ ] **API Keys**: Per-user API keys for programmatic access
- [ ] **Usage Limits**: Rate limiting and quotas
- [ ] **Billing**: Subscription tiers (free, pro, enterprise)
- [ ] **White-Label**: Custom branding for enterprise customers

### 14.5 Future Considerations (2026+)
- **Mobile App**: iOS/Android app for on-the-go validation
- **Slack/Teams Integration**: Direct validation from chat
- **Auto-Resolution**: Automatically flag issues in Atlassian system
- **Machine Learning**: Predict likely pricing errors before they occur
- **Multi-Marketplace**: Support other marketplaces (Salesforce, Microsoft)
- **Refund Workflow**: Integrated refund request system
- **Contract Management**: Track partner agreements and auto-validate against terms
- **Advanced Reporting**: Custom report builder with drag-and-drop

---

## 15. Appendices

### 15.1 Appendix A: API Token Setup

**Step-by-Step Guide**:
1. Navigate to https://id.atlassian.com/manage-profile/security/api-tokens
2. Log in with Atlassian account
3. Click "Create API token"
4. Enter label: "MPWatcher Validation Tool"
5. Click "Create"
6. Copy token immediately (shown once)
7. Add to environment variables:
   - Development: `.env.local`
   - Production: Vercel environment variables

### 15.2 Appendix B: Developer ID Retrieval

**Step-by-Step Guide**:
1. Navigate to https://developer.atlassian.com/console/myapps/
2. Log in with vendor account
3. Select your app (or organization)
4. Copy Developer ID from URL or settings
5. Format: UUID (e.g., `39811bd6-659c-4089-a14f-a016fbfec7d9`)

### 15.3 Appendix C: Marketplace API Documentation

**Official Documentation**:
- Base URL: https://api.atlassian.com/marketplace/rest
- API Docs: https://developer.atlassian.com/cloud/marketplace/rest/
- Transaction Endpoint: `/3/reporting/developer-space/{developerId}/sales/transactions`

**Rate Limits** (as of 2024):
- 100 requests per minute
- 10,000 requests per day
- Pagination: 100 transactions per page (max)

### 15.4 Appendix D: Technology Decision Log

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Framework | React SPA, Next.js, Remix | Next.js | Full-stack, Vercel optimization, API routes |
| Language | JavaScript, TypeScript | TypeScript | Type safety, better DX, reduced bugs |
| Scraping | Puppeteer, Playwright, Cheerio | Cheerio | Lightweight, fast, no browser overhead |
| Styling | Tailwind, CSS Modules, Styled-components | Inline CSS | Simplicity, no build config, one file |
| Hosting | Vercel, Netlify, AWS, Heroku | Vercel | Best Next.js integration, auto-deploy |
| Database | PostgreSQL, MongoDB, None | None (V1) | Stateless design, add in V2 if needed |
| Testing | Jest, Vitest, Playwright | None (V1) | Manual testing sufficient for MVP |

### 15.5 Appendix E: Glossary

- **Add-on Key**: Unique identifier for Atlassian marketplace app (e.g., `com.example.myapp`)
- **API Token**: Authentication credential for Atlassian API (not same as OAuth)
- **Basic Auth**: HTTP authentication using username:password (email:apiToken)
- **Developer ID**: UUID identifying vendor organization in Atlassian ecosystem
- **License Tier**: User count bracket for pricing (e.g., "1-10 users", "11-25 users")
- **Partner Cut**: Percentage of revenue shared with partner (e.g., 20%)
- **Pricing Fetcher**: Service that scrapes marketplace HTML for current pricing
- **Serverless Function**: Stateless compute that runs on-demand (Vercel functions)
- **Vendor Amount**: Revenue received by app vendor after all deductions
- **Validation Report**: Structured output containing all transaction validation results

### 15.6 Appendix F: File Structure Reference

```
mpwatcher/
├── .git/                          # Git version control
├── .gitignore                     # Git exclusions
├── .nvmrc                         # Node version specification
├── .env.example                   # Environment template (production)
├── .env.local.example             # Environment template (development)
├── .env.local                     # Local secrets (not versioned)
│
├── lib/                           # Core business logic
│   ├── atlassian-api.ts           # Atlassian API client
│   ├── pricing-fetcher.ts         # Marketplace price scraper
│   ├── validator.ts               # Validation engine
│   └── report-generator.ts        # Report formatting
│
├── types/                         # TypeScript definitions
│   └── index.ts                   # Interface exports
│
├── pages/                         # Next.js pages and routes
│   ├── _app.tsx                   # App wrapper
│   ├── index.tsx                  # Homepage UI
│   └── api/
│       ├── health.ts              # Health check endpoint
│       └── validate.ts            # Validation API endpoint
│
├── .next/                         # Build output (generated)
├── node_modules/                  # Dependencies (generated)
│
├── next.config.js                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Dependency lock file
├── vercel.json                    # Vercel configuration
│
├── README.md                      # User documentation
└── DEPLOYMENT.md                  # Deployment guide
```

### 15.7 Appendix G: Common Error Messages

| Error | Cause | Resolution |
|-------|-------|------------|
| "Missing required environment variable: ATLASSIAN_EMAIL" | Env var not set | Add to .env.local or Vercel settings |
| "Invalid credentials" | Wrong email/API token | Regenerate token at id.atlassian.com |
| "Failed to fetch transactions" | API error or timeout | Check network, verify developer ID |
| "Failed to fetch pricing for app" | Marketplace scraping failure | App may not exist or HTML changed |
| "Method not allowed" | Using wrong HTTP method | Use GET or POST for /api/validate |
| "Timeout of 30000ms exceeded" | API taking too long | Reduce date range or check Atlassian status |

### 15.8 Appendix H: Testing Checklist

**Manual Testing Checklist (MVP)**:
- [ ] Homepage loads correctly
- [ ] Date picker works (optional fields)
- [ ] Format dropdown has 3 options
- [ ] Submit without dates (validates all transactions)
- [ ] Submit with date range (filters correctly)
- [ ] HTML format opens in new window
- [ ] JSON format downloads file
- [ ] Text format downloads file
- [ ] Error displays for network failure
- [ ] Health endpoint returns 200 OK
- [ ] Health endpoint shows correct config
- [ ] API validation endpoint works via curl
- [ ] Price validation detects $2+ discrepancies
- [ ] Discount validation catches missing explanations
- [ ] Partner cut validation works for Table Grid
- [ ] Report summary counts match results
- [ ] Invalid transactions flagged correctly

---

## 16. Conclusion

This Product Requirements Document provides comprehensive specifications for building the MPWatcher (Marketplace Transaction Validator) application from scratch. The document covers:

- **Business Context**: Problem, solution, and success criteria
- **Functional Requirements**: All features and validation logic
- **Technical Specifications**: Architecture, data models, and API contracts
- **User Experience**: UI mockups and interaction patterns
- **Security & Compliance**: Authentication, secrets management, and data protection
- **Deployment Guide**: Vercel setup and alternative hosting options
- **Future Vision**: Roadmap for enhancements and scaling

**Key Takeaways**:
1. **Simplicity First**: MVP focuses on core validation without over-engineering
2. **Stateless Design**: No database required for initial deployment
3. **Multi-Format Output**: Serves both technical and non-technical users
4. **Vercel-Optimized**: Leverages Next.js and serverless functions
5. **Extensible**: Architecture supports future enhancements

**Next Steps**:
1. Set up development environment (Node.js, npm)
2. Initialize Next.js project with TypeScript
3. Implement service layer (lib/ modules)
4. Build API endpoints (pages/api/)
5. Create web UI (pages/index.tsx)
6. Configure environment variables
7. Deploy to Vercel
8. Validate with real marketplace data

For questions or clarifications, refer to:
- README.md: User-facing documentation
- DEPLOYMENT.md: Deployment instructions
- This PRD: Complete specifications

**Document Version**: 1.0
**Last Updated**: October 27, 2025
**Maintained By**: Product Team
