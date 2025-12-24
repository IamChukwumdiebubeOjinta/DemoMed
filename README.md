# DemoMed Healthcare API Assessment

A Next.js web application that integrates with the DemoMed Healthcare API to calculate patient risk scores and submit assessment results.

## Features

- **Patient Data Fetching**: Automatically fetches all patient data with pagination support
- **Risk Scoring**: Calculates risk scores based on:
  - Blood Pressure (4 stages: Normal, Elevated, Stage 1, Stage 2)
  - Temperature (Normal, Low Fever, High Fever)
  - Age (Under 40, 40-65, Over 65)
- **Error Handling**: Robust retry logic with exponential backoff for rate limiting and transient errors
- **Data Validation**: Identifies and handles invalid/missing data
- **Alert Lists**: Generates lists for:
  - High-risk patients (total risk score ≥ 4)
  - Fever patients (temperature ≥ 99.6°F)
  - Data quality issues (invalid/missing BP, Age, or Temp)
- **Assessment Submission**: Submits results to the assessment API with feedback display

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure API Key** (optional):
   Create a `.env.local` file in the root directory:

   ```
   NEXT_PUBLIC_API_KEY=your-api-key-here
   ```

   If not set, the application will use the default API key provided in the assessment.

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles
├── components/
│   ├── PatientCard.tsx   # Patient display component
│   ├── AlertList.tsx     # Alert list display component
│   └── SubmissionStatus.tsx # Submission results component
├── lib/
│   ├── api-client.ts     # API client with retry logic
│   ├── types.ts          # TypeScript type definitions
│   ├── risk-scoring.ts   # Risk calculation functions
│   └── data-processor.ts # Data processing utilities
└── README.md
```

## API Integration

The application integrates with the DemoMed Healthcare API:

- **Base URL**: `https://assessment.ksensetech.com/api`
- **Authentication**: Uses `x-api-key` header
- **Endpoints**:
  - `GET /patients` - Fetch patient data (with pagination)
  - `POST /submit-assessment` - Submit assessment results

## Risk Scoring Logic

### Blood Pressure

- Normal (Systolic <120 AND Diastolic <80): 1 point
- Elevated (Systolic 120-129 AND Diastolic <80): 2 points
- Stage 1 (Systolic 130-139 OR Diastolic 80-89): 3 points
- Stage 2 (Systolic ≥140 OR Diastolic ≥90): 4 points
- Invalid/Missing: 0 points

### Temperature

- Normal (≤99.5°F): 0 points
- Low Fever (99.6-100.9°F): 1 point
- High Fever (≥101°F): 2 points
- Invalid/Missing: 0 points

### Age

- Under 40 (<40 years): 1 point
- 40-65 (40-65 years, inclusive): 1 point
- Over 65 (>65 years): 2 points
- Invalid/Missing: 0 points

**Total Risk Score** = BP Score + Temp Score + Age Score

## Error Handling

The application includes robust error handling:

- **Rate Limiting**: Automatic retry with exponential backoff (1s, 2s, 4s)
- **Transient Errors**: Retries for 500/503 errors (up to 3 attempts)
- **Data Validation**: Handles missing, malformed, or invalid data gracefully

## License

MIT
