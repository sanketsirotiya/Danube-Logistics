# Delivery Orders Feature

## Overview

The Delivery Orders feature allows you to manage container delivery requests from clients. This system tracks deliveries from the port to customer locations, integrating seamlessly with your existing trips, trucks, drivers, and invoicing systems.

---

## Features

### ✨ Core Functionality

- **Order Management**: Create, edit, view, and track delivery orders
- **Status Tracking**: Monitor orders through their lifecycle (Pending → Assigned → In Transit → Delivered)
- **Priority Levels**: Classify orders as Standard, Urgent, or Critical
- **Container Tracking**: Track container numbers, sizes, and types
- **Location Management**: Manage port pickups and customer delivery addresses
- **Date Tracking**: Schedule requested and actual pickup/delivery dates
- **Reference Numbers**: Track customer references, booking numbers, and bills of lading
- **Special Instructions**: Add cargo descriptions and handling instructions
- **Integration**: Seamlessly link delivery orders to trips for dispatch

---

## Installation & Setup

### 1. Apply Database Migration

Run the Prisma migration to create the necessary database tables:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Apply migration manually (if needed)
psql -U your_username -d your_database -f prisma/migrations/add_delivery_orders.sql

# OR use Prisma migrate
npx prisma migrate dev --name add_delivery_orders
```

### 2. Verify Installation

Check that the new tables were created:

```bash
npx prisma studio
```

Look for the `delivery_orders` table in Prisma Studio.

---

## User Guide

### Creating a Delivery Order

1. Navigate to **Delivery Orders** from the home page
2. Click **+ New Order** button
3. Fill in the required information:

#### Required Fields:
- **Customer**: Select from existing customers
- **Port of Loading**: Enter the port name (e.g., "Port of Los Angeles")
- **Delivery Address**: Enter the destination address

#### Optional Fields:
- **Container Number**: Container ID (e.g., "ABCD1234567")
- **Container Size**: 20ft, 40ft, or 45ft
- **Container Type**: Dry, Reefer, Tank, or Flat Rack
- **Priority**: Standard, Urgent, or Critical
- **Weight**: Cargo weight in pounds
- **Requested Pickup Date**: When to pick up from port
- **Requested Delivery Date**: Target delivery date
- **Customer Reference**: Client's PO or reference number
- **Booking Number**: Shipping line booking number
- **Bill of Lading**: BOL number
- **Cargo Description**: What's in the container
- **Special Instructions**: Handling requirements
- **Notes**: Internal notes

4. Click **Create Order**

### Viewing Order Details

1. From the Delivery Orders list, click **View** on any order
2. The detail page shows:
   - **Order Status**: Current status with colored badge
   - **Customer Information**: Contact details
   - **Container & Cargo**: Full container specifications
   - **Delivery Route**: Port → Destination with visual flow
   - **Timeline**: Chronological events
   - **Priority Level**: Highlighted priority badge

### Updating Order Status

From the order detail page:

1. Use the **Update Status** sidebar
2. Click the desired status:
   - **PENDING**: Order received, not yet assigned
   - **ASSIGNED**: Assigned to driver/truck
   - **IN_TRANSIT**: Container picked up, in delivery
   - **DELIVERED**: Successfully delivered
   - **CANCELLED**: Order cancelled

**Note**: Status changes automatically set actual pickup/delivery dates:
- Setting to **IN_TRANSIT** records actual pickup time
- Setting to **DELIVERED** records actual delivery time

### Editing an Order

1. From the list, click **Edit** on the order
2. Modify any fields
3. Click **Update Order**

### Deleting an Order

1. From the list, click **Delete** on the order
2. Confirm the deletion in the popup

**Warning**: Deletion is permanent and cannot be undone!

---

## Integration with Existing Systems

### Linking to Trips

When you're ready to dispatch a delivery order:

1. Create a new trip from the **Trips** page
2. The delivery order can be manually linked via the API
3. Once linked, the trip status will sync with the delivery order

### Customer Integration

- Delivery orders are linked to existing customers
- Customer rates and pricing types are inherited
- Invoice generation can use delivery order data

### Driver & Truck Assignment

Future enhancement will allow:
- Direct assignment of drivers and trucks from the delivery order page
- Automatic trip creation from delivery orders
- Real-time tracking integration

---

## API Endpoints

### Get All Delivery Orders
```
GET /api/delivery-orders
```

Response includes customer details and trip information.

### Get Single Delivery Order
```
GET /api/delivery-orders/[id]
```

Returns full order details with nested customer and trip data.

### Create Delivery Order
```
POST /api/delivery-orders

Body:
{
  "customerId": "uuid",
  "portOfLoading": "Port of Los Angeles",
  "deliveryAddress": "123 Main St",
  "containerNumber": "ABCD1234567",
  "containerSize": "FORTY_FT",
  "containerType": "DRY",
  "priority": "URGENT",
  ...
}
```

### Update Delivery Order
```
PUT /api/delivery-orders/[id]

Body: {
  "status": "IN_TRANSIT",
  "actualPickupDate": "2026-02-10T14:30:00Z",
  ...
}
```

### Delete Delivery Order
```
DELETE /api/delivery-orders/[id]
```

---

## Database Schema

### DeliveryOrder Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID) | Yes | Primary key |
| orderNumber | String | Yes | Unique order identifier (auto-generated) |
| customerId | String | Yes | Reference to Customer |
| containerNumber | String | No | Container ID |
| containerSize | Enum | No | TWENTY_FT, FORTY_FT, FORTY_FIVE_FT |
| containerType | Enum | No | DRY, REEFER, TANK, FLAT_RACK |
| status | Enum | Yes | PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED |
| priority | Enum | Yes | STANDARD, URGENT, CRITICAL |
| portOfLoading | String | Yes | Pickup location (port) |
| deliveryAddress | String | Yes | Delivery destination |
| deliveryCity | String | No | Delivery city |
| deliveryState | String | No | Delivery state |
| deliveryZip | String | No | Delivery ZIP code |
| requestedPickupDate | DateTime | No | Requested pickup date |
| requestedDeliveryDate | DateTime | No | Requested delivery date |
| actualPickupDate | DateTime | No | Actual pickup timestamp |
| actualDeliveryDate | DateTime | No | Actual delivery timestamp |
| customerReference | String | No | Client PO/reference |
| bookingNumber | String | No | Booking number |
| billOfLading | String | No | BOL number |
| tripId | String | No | Linked trip (unique) |
| cargoDescription | String | No | Cargo details |
| weight | Decimal | No | Weight in pounds |
| specialInstructions | Text | No | Handling instructions |
| notes | Text | No | Internal notes |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

### Enums

```typescript
enum DeliveryOrderStatus {
  PENDING
  ASSIGNED
  IN_TRANSIT
  DELIVERED
  CANCELLED
}

enum DeliveryPriority {
  STANDARD
  URGENT
  CRITICAL
}
```

---

## Statistics & Reporting

The main Delivery Orders page displays:

- **Total Orders**: All delivery orders in system
- **Pending**: Orders awaiting assignment
- **In Transit**: Currently being delivered
- **Delivered**: Completed deliveries

---

## Best Practices

### Order Creation
1. Always include customer reference numbers for easier tracking
2. Set realistic requested delivery dates
3. Add special instructions for fragile or hazardous cargo
4. Specify container type if known

### Status Management
1. Update status promptly as order progresses
2. Use ASSIGNED status when driver/truck assigned
3. Set IN_TRANSIT when container is picked up
4. Mark DELIVERED only after customer confirmation
5. Use CANCELLED with a note explaining why

### Priority Levels
- **STANDARD**: Normal delivery timeline (3-5 days)
- **URGENT**: Expedited delivery (1-2 days)
- **CRITICAL**: Same-day or emergency delivery

---

## Troubleshooting

### Order Not Appearing in List
- Refresh the page
- Check browser console for errors
- Verify database connection

### Cannot Update Status
- Ensure you have permissions
- Check if order is already delivered or cancelled
- Verify API endpoint is accessible

### Missing Customer in Dropdown
- Ensure customer is marked as "active"
- Create the customer first in Customer Portal
- Refresh the page after adding new customer

---

## Future Enhancements

Planned features for future releases:

1. **Automatic Trip Creation**: Create trips directly from delivery orders
2. **Real-time GPS Tracking**: Track container location in transit
3. **Customer Portal**: Allow customers to create and track their own orders
4. **Email Notifications**: Auto-notify customers of status changes
5. **Photo Upload**: Attach photos of container condition
6. **Signature Capture**: Digital POD signatures
7. **Route Optimization**: AI-powered delivery route planning
8. **Mobile App**: Driver app for order management
9. **Bulk Import**: CSV import for multiple orders
10. **Analytics Dashboard**: Delivery performance metrics

---

## Support

For questions or issues:

1. Check this documentation first
2. Review the API documentation
3. Contact your system administrator
4. Submit issues via your project management system

---

## Technical Notes

### File Structure
```
src/app/
├── delivery-orders/
│   ├── page.tsx                    # Main listing page
│   ├── [id]/
│   │   └── page.tsx                # Detail view page
│   └── __tests__/
│       └── (future test files)
├── api/
│   └── delivery-orders/
│       ├── route.ts                # GET, POST endpoints
│       └── [id]/
│           └── route.ts            # GET, PUT, DELETE endpoints
prisma/
├── schema.prisma                   # Updated schema
└── migrations/
    └── add_delivery_orders.sql    # Migration file
```

### Color Scheme
The feature uses **cyan/teal** as its primary color to differentiate from other modules:
- Primary: `cyan-600` / `cyan-700`
- Hover: `cyan-50` / `cyan-100`
- This matches the professional design of the rest of the application

---

## Version History

### v1.0.0 (February 2026)
- Initial release
- Core CRUD operations
- Status tracking
- Priority management
- Customer integration
- Container tracking
- Timeline view
- Professional UI matching app theme

---

**Built for Danube Logistics** | Enterprise Freight Management Platform
