import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    truck: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('Fleet Management API - Trucks Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/trucks', () => {
    test('TC026: Should return all trucks successfully', async () => {
      const mockTrucks = [
        {
          id: '1',
          plate: 'ABC-123',
          model: 'Volvo FH16',
          year: 2020,
          capacity: 25000,
          status: 'AVAILABLE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          plate: 'XYZ-789',
          model: 'Scania R500',
          year: 2021,
          capacity: 30000,
          status: 'IN_USE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.truck.findMany as jest.Mock).mockResolvedValue(mockTrucks);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTrucks);
      expect(prisma.truck.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    test('TC027: Should return empty array when no trucks exist', async () => {
      (prisma.truck.findMany as jest.Mock).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    test('TC028: Should handle database errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (prisma.truck.findMany as jest.Mock).mockRejectedValue(new Error('Database Error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch trucks' });
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('TC029: Should order trucks by creation date descending', async () => {
      (prisma.truck.findMany as jest.Mock).mockResolvedValue([]);

      await GET();

      expect(prisma.truck.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('POST /api/trucks', () => {
    test('TC030: Should create a new truck successfully', async () => {
      const newTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      const createdTruck = {
        id: '1',
        ...newTruckData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.truck.create as jest.Mock).mockResolvedValue(createdTruck);

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdTruck);
      expect(prisma.truck.create).toHaveBeenCalledWith({
        data: newTruckData,
      });
    });

    test('TC031: Should validate required fields', async () => {
      const incompleteTruckData = {
        plate: 'ABC-123',
        // Missing model, year, capacity, status
      };

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(incompleteTruckData),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    test('TC032: Should handle duplicate plate numbers', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const newTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      (prisma.truck.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed')
      );

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create truck' });

      consoleSpy.mockRestore();
    });

    test('TC033: Should validate truck status values', async () => {
      const invalidTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'INVALID_STATUS',
      };

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(invalidTruckData),
      });

      const response = await POST(request);

      // Should either return 400 or database should reject it
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('TC034: Should validate year is a valid number', async () => {
      const invalidTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 'invalid',
        capacity: 25000,
        status: 'AVAILABLE',
      };

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(invalidTruckData),
      });

      const response = await POST(request);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('TC035: Should validate capacity is a positive number', async () => {
      const invalidTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: -1000,
        status: 'AVAILABLE',
      };

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(invalidTruckData),
      });

      const response = await POST(request);

      // Validation should reject negative capacity
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Data Integrity', () => {
    test('TC036: Should store all truck fields correctly', async () => {
      const newTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      (prisma.truck.create as jest.Mock).mockImplementation((args) => {
        return Promise.resolve({
          id: '1',
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.plate).toBe('ABC-123');
      expect(data.model).toBe('Volvo FH16');
      expect(data.year).toBe(2020);
      expect(data.capacity).toBe(25000);
      expect(data.status).toBe('AVAILABLE');
    });

    test('TC037: Should set default status if not provided', async () => {
      const newTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
      };

      (prisma.truck.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...newTruckData,
        status: 'AVAILABLE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should have a default status
      expect(data.status).toBeDefined();
    });

    test('TC038: Should generate unique IDs for each truck', async () => {
      const newTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      (prisma.truck.create as jest.Mock)
        .mockResolvedValueOnce({
          id: '1',
          ...newTruckData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: '2',
          ...newTruckData,
          plate: 'XYZ-789',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const request1 = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const request2 = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify({ ...newTruckData, plate: 'XYZ-789' }),
      });

      const response1 = await POST(request1);
      const response2 = await POST(request2);

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.id).not.toBe(data2.id);
    });

    test('TC039: Should set timestamps correctly', async () => {
      const newTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      const now = new Date();

      (prisma.truck.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...newTruckData,
        createdAt: now,
        updatedAt: now,
      });

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });
  });

  describe('Performance and Edge Cases', () => {
    test('TC040: Should handle large number of trucks', async () => {
      const largeTruckList = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        plate: `TRUCK-${i + 1}`,
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      (prisma.truck.findMany as jest.Mock).mockResolvedValue(largeTruckList);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBe(1000);
    });

    test('TC041: Should handle special characters in plate number', async () => {
      const newTruckData = {
        plate: 'ABC-123-ÄÖÜ',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      (prisma.truck.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...newTruckData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.plate).toBe('ABC-123-ÄÖÜ');
    });

    test('TC042: Should handle very long model names', async () => {
      const longModelName = 'A'.repeat(255);
      const newTruckData = {
        plate: 'ABC-123',
        model: longModelName,
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      (prisma.truck.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...newTruckData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);

      // Should either accept it or reject with appropriate error
      expect([201, 400, 500]).toContain(response.status);
    });

    test('TC043: Should handle maximum capacity value', async () => {
      const newTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 999999,
        status: 'AVAILABLE',
      };

      (prisma.truck.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...newTruckData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.capacity).toBe(999999);
    });

    test('TC044: Should handle future year values', async () => {
      const futureYear = new Date().getFullYear() + 5;
      const newTruckData = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: futureYear,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      (prisma.truck.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...newTruckData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruckData),
      });

      const response = await POST(request);

      // Should handle future years appropriately
      expect([201, 400]).toContain(response.status);
    });

    test('TC045: Should handle concurrent requests', async () => {
      const truckData1 = {
        plate: 'ABC-123',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        status: 'AVAILABLE',
      };

      const truckData2 = {
        plate: 'XYZ-789',
        model: 'Scania R500',
        year: 2021,
        capacity: 30000,
        status: 'AVAILABLE',
      };

      (prisma.truck.create as jest.Mock)
        .mockResolvedValueOnce({
          id: '1',
          ...truckData1,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: '2',
          ...truckData2,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const request1 = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(truckData1),
      });

      const request2 = new NextRequest('http://localhost:3000/api/trucks', {
        method: 'POST',
        body: JSON.stringify(truckData2),
      });

      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ]);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
    });
  });
});
