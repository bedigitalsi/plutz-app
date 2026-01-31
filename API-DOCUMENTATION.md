# Plutz API Documentation

## Overview

The Plutz API allows you to manage inquiries (events/gigs) programmatically. All endpoints require authentication via an API key.

---

## Authentication

All API requests require a Bearer token in the `Authorization` header. You can create API keys in the Plutz application under **Settings > API Keys**.

```
Authorization: Bearer YOUR_API_KEY
```

### Required Headers

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer YOUR_API_KEY` |
| `Accept` | `application/json` |
| `Content-Type` | `application/json` (for POST/PUT/PATCH requests) |

---

## Base URL

```
https://your-domain.com/api/v1
```

For local development:
```
http://127.0.0.1:8000/api/v1
```

---

## Rate Limiting

- **60 requests per minute** per authenticated user
- When exceeded, the API returns `429 Too Many Requests`
- Rate limit headers are included in responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Error Responses

### 401 Unauthenticated
Missing or invalid API key.
```json
{
    "message": "Unauthenticated."
}
```

### 403 Forbidden
Token does not have the required permission.
```json
{
    "message": "Token does not have the required permission: inquiries.view"
}
```

### 404 Not Found
Resource does not exist.
```json
{
    "message": "No query results for model [App\\Models\\Inquiry] 999"
}
```

### 422 Validation Error
Invalid request data. Returns field-level error messages.
```json
{
    "message": "The performance date field is required. (and 2 more errors)",
    "errors": {
        "performance_date": ["The performance date field is required."],
        "location_name": ["The location name field is required."],
        "contact_person": ["The contact person field is required."]
    }
}
```

---

## Token Permissions

When creating an API key, you select which permissions the key has. Each endpoint requires a specific permission:

| Permission | Endpoints |
|------------|-----------|
| `inquiries.view` | GET /inquiries, GET /inquiries/{id} |
| `inquiries.create` | POST /inquiries |
| `inquiries.edit` | PUT /inquiries/{id}, DELETE /inquiries/{id} |
| `inquiries.change_status` | PATCH /inquiries/{id}/status |

A token can only use permissions that the underlying user account also has.

---

## Endpoints

### List Inquiries

```
GET /api/v1/inquiries
```

**Permission:** `inquiries.view`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `confirmed`, `rejected` |
| `date_from` | date | Filter: performance date >= this date (YYYY-MM-DD) |
| `date_to` | date | Filter: performance date <= this date (YYYY-MM-DD) |
| `search` | string | Search in location name, contact person, contact email |
| `per_page` | integer | Results per page (default: 20) |
| `page` | integer | Page number (default: 1) |

**Example:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/inquiries?status=confirmed&per_page=10" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

**Response (200):**
```json
{
    "data": [
        {
            "id": 1,
            "public_id": "550e8400-e29b-41d4-a716-446655440000",
            "performance_date": "2025-03-15",
            "performance_time_mode": "exact_time",
            "performance_time_exact": "18:00",
            "performance_time_text": null,
            "duration_minutes": 120,
            "location_name": "Grand Hotel",
            "location_address": "Main Street 1, Ljubljana",
            "contact_person": "John Doe",
            "contact_email": "john@example.com",
            "contact_phone": "+386 40 123 456",
            "status": "confirmed",
            "notes": "Outdoor stage, bring extra cables",
            "price_amount": "1500.00",
            "currency": "EUR",
            "received_at": "2025-02-01T10:30:00.000000Z",
            "created_by": 1,
            "performance_type": { "id": 1, "name": "Wedding" },
            "band_size": { "id": 2, "name": "Full Band (5)" },
            "creator": { "id": 1, "name": "Admin" }
        }
    ],
    "links": {
        "first": "http://127.0.0.1:8000/api/v1/inquiries?page=1",
        "last": "http://127.0.0.1:8000/api/v1/inquiries?page=3",
        "prev": null,
        "next": "http://127.0.0.1:8000/api/v1/inquiries?page=2"
    },
    "meta": {
        "current_page": 1,
        "last_page": 3,
        "per_page": 20,
        "total": 45
    }
}
```

---

### Get Single Inquiry

```
GET /api/v1/inquiries/{id}
```

**Permission:** `inquiries.view`

**Example:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/inquiries/1" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

**Response (200):**
```json
{
    "data": {
        "id": 1,
        "public_id": "550e8400-e29b-41d4-a716-446655440000",
        "performance_date": "2025-03-15",
        "performance_time_mode": "exact_time",
        "performance_time_exact": "18:00",
        "performance_time_text": null,
        "duration_minutes": 120,
        "location_name": "Grand Hotel",
        "location_address": "Main Street 1, Ljubljana",
        "contact_person": "John Doe",
        "contact_email": "john@example.com",
        "contact_phone": "+386 40 123 456",
        "status": "confirmed",
        "notes": "Outdoor stage",
        "price_amount": "1500.00",
        "currency": "EUR",
        "received_at": "2025-02-01T10:30:00.000000Z",
        "created_by": 1,
        "performance_type": { "id": 1, "name": "Wedding" },
        "band_size": { "id": 2, "name": "Full Band (5)" },
        "creator": { "id": 1, "name": "Admin" },
        "income": null
    }
}
```

---

### Create Inquiry

```
POST /api/v1/inquiries
```

**Permission:** `inquiries.create`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `performance_date` | date | **Yes** | Date of the event (YYYY-MM-DD) |
| `performance_time_mode` | string | **Yes** | `exact_time` or `text_time` |
| `performance_time_exact` | string | Conditional | Time in HH:MM format (required if mode is `exact_time`) |
| `performance_time_text` | string | Conditional | Free text time description (required if mode is `text_time`) |
| `duration_minutes` | integer | No | Duration in minutes (default: 120) |
| `location_name` | string | **Yes** | Venue name (max 255 chars) |
| `location_address` | string | No | Venue address (max 500 chars) |
| `contact_person` | string | **Yes** | Contact person name (max 255 chars) |
| `contact_email` | string | No | Contact email address |
| `contact_phone` | string | No | Contact phone number (max 50 chars) |
| `performance_type_id` | integer | **Yes** | ID of the performance type |
| `band_size_id` | integer | **Yes** | ID of the band size |
| `price_amount` | number | No | Price amount (e.g. 1500.00) |
| `currency` | string | No | Currency code (default: EUR, max 3 chars) |
| `notes` | string | No | Additional notes |

**Note:** New inquiries are always created with status `pending`.

**Example:**
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/inquiries" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "performance_date": "2025-06-20",
    "performance_time_mode": "exact_time",
    "performance_time_exact": "19:00",
    "duration_minutes": 180,
    "location_name": "Park Hotel",
    "location_address": "Park Road 5, Maribor",
    "contact_person": "Jane Smith",
    "contact_email": "jane@example.com",
    "contact_phone": "+386 41 987 654",
    "performance_type_id": 1,
    "band_size_id": 2,
    "price_amount": 2000.00,
    "currency": "EUR",
    "notes": "Anniversary celebration"
  }'
```

**Response (201):**
```json
{
    "data": {
        "id": 15,
        "public_id": "generated-uuid-here",
        "performance_date": "2025-06-20",
        "status": "pending",
        "...": "..."
    }
}
```

---

### Update Inquiry

```
PUT /api/v1/inquiries/{id}
```

**Permission:** `inquiries.edit`

**Request Body:** Same fields as Create (all required fields must be included).

**Example:**
```bash
curl -X PUT "http://127.0.0.1:8000/api/v1/inquiries/15" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "performance_date": "2025-06-21",
    "performance_time_mode": "exact_time",
    "performance_time_exact": "20:00",
    "duration_minutes": 180,
    "location_name": "Park Hotel",
    "location_address": "Park Road 5, Maribor",
    "contact_person": "Jane Smith",
    "contact_email": "jane@example.com",
    "performance_type_id": 1,
    "band_size_id": 2,
    "notes": "Anniversary celebration - date changed"
  }'
```

**Response (200):**
```json
{
    "data": {
        "id": 15,
        "performance_date": "2025-06-21",
        "...": "..."
    }
}
```

---

### Delete Inquiry

```
DELETE /api/v1/inquiries/{id}
```

**Permission:** `inquiries.edit`

Performs a soft delete. The inquiry is not permanently removed from the database.

**Example:**
```bash
curl -X DELETE "http://127.0.0.1:8000/api/v1/inquiries/15" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

**Response (200):**
```json
{
    "message": "Inquiry deleted successfully."
}
```

---

### Change Inquiry Status

```
PATCH /api/v1/inquiries/{id}/status
```

**Permission:** `inquiries.change_status`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | **Yes** | `pending`, `confirmed`, or `rejected` |

**Note:** When changing status to `confirmed`, an email notification is sent to all band members after a 2-minute delay.

**Example:**
```bash
curl -X PATCH "http://127.0.0.1:8000/api/v1/inquiries/1/status" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

**Response (200):**
```json
{
    "data": {
        "id": 1,
        "status": "confirmed",
        "...": "..."
    }
}
```

---

## Getting Started

### 1. Create an API Key
1. Log in to Plutz
2. Go to **Settings > API Keys**
3. Enter a name for the key (e.g., "My Integration")
4. Select the permissions you need
5. Click **Create API Key**
6. **Copy the token immediately** — it will not be shown again

### 2. Test Your Key
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/inquiries" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

### 3. Revoking Keys
You can revoke (delete) an API key at any time in **Settings > API Keys**. Once revoked, all requests using that key will receive a `401 Unauthenticated` error.
