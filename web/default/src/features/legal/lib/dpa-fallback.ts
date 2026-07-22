export function getDpaFallbackMarkdown(brandName: string) {
  const safeBrandName = brandName.replace(/[\\`*_[\]{}()#+.!|-]/g, '\\$&')
  return `## Overview

This Data Processing Agreement ("DPA") describes how ${safeBrandName} processes personal data on behalf of customers when they use the API gateway and console.

## Roles

- **Customer** is the data controller for end-user content sent through the API.
- **${safeBrandName}** acts as a data processor, routing requests to upstream model providers under the customer's instructions.

## Processing scope

We process API request metadata (timestamps, model identifiers, token counts) and prompt content solely to provide routing, billing, logging, and support.

## Security

We apply access controls, encryption in transit, and retention limits aligned with our security documentation. Sub-processors (upstream providers) are engaged only to fulfill API requests.

## Contact

For a signed enterprise DPA, contact your account administrator or support.`
}
