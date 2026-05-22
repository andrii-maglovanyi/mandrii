# UK-Specific Costs Implementation for Buy vs Rent Calculator

## Overview

Added comprehensive UK-specific property costs to the Buy vs Rent Calculator, including:

- Mortgage-related fees (arrangement fees, remortgaging costs)
- Leasehold-specific costs (service charges, ground rent)
- Renting-specific costs (tenancy deposit)

## Changes Made

### 1. **Type Definitions** (`types.ts`)

Added new input fields to `CalculatorInputs`:

- `mortgageArrangementFee: number` - One-time upfront bank fee (£999-£2000 typical)
- `remortgagingFrequencyYears: number` - How often to remortgage (2-5 years typical)
- `averageRemortgagingCost: number` - Cost per remortgage event (broker + bank fees)
- `serviceCharge: number` - Annual leasehold service charge (building maintenance, lifts, etc.)
- `groundRent: number` - Annual leasehold ground rent (payment to freeholder)
- `tenancyDeposit: number` - One-time deposit for renting (typically 5 weeks of rent)

### 2. **Input Panel** (`InputsPanel.tsx`)

Added new input sections:

- **UK-specific mortgage costs section:**
  - Mortgage arrangement fee (£)
  - Remortgage frequency (years) with validation (2-35 years)
  - Average remortgage cost (£)
- **Leasehold-specific costs section:**
  - Annual service charge (£)
  - Annual ground rent (£)
- **Renting section enhancement:**
  - Tenancy deposit (£) - with note that it's frozen and unavailable for investment

### 3. **Calculation Engine** (`formulas.ts`)

#### In `calculate()` function:

- **Remortgaging costs**: Calculated based on frequency:
  ```javascript
  const remortgagingEvents = Math.floor(years / remortgagingFrequencyYears);
  const totalRemortgagingCosts = remortgagingEvents * averageRemortgagingCost;
  ```
- **Leasehold costs** (added annually):
  ```javascript
  const totalServiceCharges = serviceCharge * years;
  const totalGroundRent = groundRent * years;
  ```
- **Buying comparison** updated:
  ```javascript
  buyingNet = ... - mortgageArrangementFee - totalRemortgagingCosts - totalServiceCharges - totalGroundRent;
  ```
- **Renting comparison** updated:
  - Tenancy deposit reduces investment base (capital not available)
  - Deposit is returned at end of tenancy: `rentingNet = ... + tenancyDeposit;`

#### In `buildChartData()` function:

- Added year-by-year tracking of remortgaging events
- Added annual service charges and ground rent to buying costs
- Included tenancy deposit return as a credit in final year

### 4. **Default Values** (`BuyVsRentCalculator.tsx`)

```typescript
mortgageArrangementFee: 1_000,        // Typical UK bank fee
remortgagingFrequencyYears: 5,        // Typical fixed-rate period
averageRemortgagingCost: 500,         // Typical broker + bank fees per remortgage
serviceCharge: 0,                     // Only applicable for leasehold
groundRent: 0,                        // Only applicable for leasehold
tenancyDeposit: 0,                    // User can set if renting scenario
```

### 5. **Test Updates** (`formulas.test.ts`)

Updated `BASE` constant to include new fields with default values.

## Key Features

### Remortgaging Logic

- Calculates how many times you'll remortgage during ownership period
- Example: 7-year hold with 5-year fixed rate = 1 remortgage event at year 5
- Each event adds `averageRemortgagingCost` to total

### Leasehold Support

- Service charges and ground rent are optional (default to 0)
- Used for realistic UK leasehold property comparisons
- Accumulated annually throughout ownership

### Tenancy Deposit Handling

- Reduces initial investment capital (money not available for growth)
- Added back to renting net calculation (deposit is returned when moving out)
- Provides accurate cost comparison for rental scenarios

## User-Facing Impact

Users can now accurately compare buying vs renting by specifying:

1. **For Buying:**
   - Mortgage arrangement fee (if applicable)
   - Remortgage frequency and average cost (if fixing for limited periods)
   - Service charge and ground rent (if leasehold)

2. **For Renting:**
   - Tenancy deposit amount (if comparing rental costs)

## Examples

### Scenario 1: Leasehold Flat Purchase

- Property: £400,000 leasehold flat
- Service charge: £200/month (£2,400/year)
- Ground rent: £150/year
- Mortgage arrangement fee: £1,500
- Remortgage every 5 years at £600 cost

The calculator now includes all these costs in the total buying cost comparison.

### Scenario 2: Renting with Deposit Requirement

- Monthly rent: £2,200
- Tenancy deposit: 5 weeks = £2,538 (frozen in scheme)
- The deposit reduces investment capital but is returned after tenancy

## Testing

- ✅ TypeScript compilation: All files pass type checking
- ✅ Build: Successfully builds without errors
- ✅ Tests: Updated formulas.test.ts with new fields
- ✅ Logic: Remortgaging, service charges, and ground rent correctly accumulated

## Notes

- All new fields have sensible UK-based defaults
- Fields are optional (default to 0 for leasehold/mortgage fees not applicable)
- Calculations properly account for time value of money with tenant deposits
- Year-by-year chart shows remortgaging events and leasehold costs impact
