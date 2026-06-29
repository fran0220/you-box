/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
export const DPA_FALLBACK_MARKDOWN = `## Overview

This Data Processing Agreement ("DPA") describes how YouBox processes personal data on behalf of customers when they use the API gateway and console.

## Roles

- **Customer** is the data controller for end-user content sent through the API.
- **YouBox** acts as a data processor, routing requests to upstream model providers under the customer's instructions.

## Processing scope

We process API request metadata (timestamps, model identifiers, token counts) and prompt content solely to provide routing, billing, logging, and support.

## Security

We apply access controls, encryption in transit, and retention limits aligned with our security documentation. Sub-processors (upstream providers) are engaged only to fulfill API requests.

## Contact

For a signed enterprise DPA, contact your account administrator or support.`