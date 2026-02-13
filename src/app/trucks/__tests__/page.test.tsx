import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrucksPage from '../page';

// Mock fetch API
global.fetch = jest.fn();

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('Fleet Management - Trucks Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    test('TC001: Should render the page title and header correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        expect(screen.getByText('Fleet Management')).toBeInTheDocument();
        expect(screen.getByText('Manage your fleet of trucks and their status')).toBeInTheDocument();
      });
    });

    test('TC002: Should display Home button', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const homeLink = screen.getByRole('link', { name: /home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
      });
    });

    test('TC003: Should display "Add New Truck" button', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Add New Truck')).toBeInTheDocument();
      });
    });
  });

  describe('Truck List Display', () => {
    test('TC004: Should display empty state when no trucks exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        expect(screen.getByText('No trucks found')).toBeInTheDocument();
        expect(screen.getByText('Add your first truck to get started!')).toBeInTheDocument();
      });
    });

    test('TC005: Should display list of trucks when data exists', async () => {
      const mockTrucks = [
        {
          id: '1',
          plate: 'ABC-123',
          model: 'Volvo FH16',
          year: 2020,
          capacity: 25000,
          status: 'AVAILABLE',
        },
        {
          id: '2',
          plate: 'XYZ-789',
          model: 'Scania R500',
          year: 2021,
          capacity: 30000,
          status: 'IN_USE',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        expect(screen.getByText('ABC-123')).toBeInTheDocument();
        expect(screen.getByText('XYZ-789')).toBeInTheDocument();
        expect(screen.getByText('Volvo FH16')).toBeInTheDocument();
        expect(screen.getByText('Scania R500')).toBeInTheDocument();
      });
    });

    test('TC006: Should display truck status with correct styling', async () => {
      const mockTrucks = [
        {
          id: '1',
          plate: 'ABC-123',
          model: 'Volvo FH16',
          year: 2020,
          capacity: 25000,
          status: 'AVAILABLE',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const statusBadge = screen.getByText('AVAILABLE');
        expect(statusBadge).toBeInTheDocument();
        expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
      });
    });
  });

  describe('Statistics Display', () => {
    test('TC007: Should calculate and display total trucks correctly', async () => {
      const mockTrucks = [
        { id: '1', plate: 'ABC-123', model: 'Volvo', year: 2020, capacity: 25000, status: 'AVAILABLE' },
        { id: '2', plate: 'XYZ-789', model: 'Scania', year: 2021, capacity: 30000, status: 'IN_USE' },
        { id: '3', plate: 'DEF-456', model: 'MAN', year: 2019, capacity: 20000, status: 'MAINTENANCE' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const totalTrucksSection = screen.getByText('Total Trucks').parentElement;
        expect(totalTrucksSection).toHaveTextContent('3');
      });
    });

    test('TC008: Should calculate available trucks correctly', async () => {
      const mockTrucks = [
        { id: '1', plate: 'ABC-123', model: 'Volvo', year: 2020, capacity: 25000, status: 'AVAILABLE' },
        { id: '2', plate: 'XYZ-789', model: 'Scania', year: 2021, capacity: 30000, status: 'AVAILABLE' },
        { id: '3', plate: 'DEF-456', model: 'MAN', year: 2019, capacity: 20000, status: 'IN_USE' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const availableSection = screen.getByText('Available').parentElement;
        expect(availableSection).toHaveTextContent('2');
      });
    });

    test('TC009: Should calculate in-use trucks correctly', async () => {
      const mockTrucks = [
        { id: '1', plate: 'ABC-123', model: 'Volvo', year: 2020, capacity: 25000, status: 'AVAILABLE' },
        { id: '2', plate: 'XYZ-789', model: 'Scania', year: 2021, capacity: 30000, status: 'IN_USE' },
        { id: '3', plate: 'DEF-456', model: 'MAN', year: 2019, capacity: 20000, status: 'IN_USE' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const inUseSection = screen.getByText('In Use').parentElement;
        expect(inUseSection).toHaveTextContent('2');
      });
    });

    test('TC010: Should calculate maintenance trucks correctly', async () => {
      const mockTrucks = [
        { id: '1', plate: 'ABC-123', model: 'Volvo', year: 2020, capacity: 25000, status: 'AVAILABLE' },
        { id: '2', plate: 'XYZ-789', model: 'Scania', year: 2021, capacity: 30000, status: 'MAINTENANCE' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const maintenanceSection = screen.getByText('Maintenance').parentElement;
        expect(maintenanceSection).toHaveTextContent('1');
      });
    });
  });

  describe('Form Operations', () => {
    test('TC011: Should show form when Add New Truck button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add New Truck');
        fireEvent.click(addButton);
        expect(screen.getByText('Add New Truck')).toBeInTheDocument();
      });
    });

    test('TC012: Should hide form when Cancel button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add New Truck');
        fireEvent.click(addButton);
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Add New Truck')).not.toBeInTheDocument();
      });
    });

    test('TC013: Should validate required fields on form submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add New Truck');
        fireEvent.click(addButton);
      });

      const submitButton = screen.getByText('Create Truck');
      fireEvent.click(submitButton);

      // Form should not submit without required fields
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only initial load
    });

    test('TC014: Should create new truck with valid data', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              id: '1',
              plate: 'ABC-123',
              model: 'Volvo FH16',
              year: 2020,
              capacity: 25000,
              status: 'AVAILABLE',
            },
          ],
        });

      render(<TrucksPage />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add New Truck');
        fireEvent.click(addButton);
      });

      // Fill in the form
      const plateInput = screen.getByLabelText(/plate number/i);
      const modelInput = screen.getByLabelText(/model/i);
      const yearInput = screen.getByLabelText(/year/i);
      const capacityInput = screen.getByLabelText(/capacity/i);

      await user.type(plateInput, 'ABC-123');
      await user.type(modelInput, 'Volvo FH16');
      await user.type(yearInput, '2020');
      await user.type(capacityInput, '25000');

      const submitButton = screen.getByText('Create Truck');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/trucks',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });
  });

  describe('Edit and Delete Operations', () => {
    test('TC015: Should populate form when Edit button is clicked', async () => {
      const mockTrucks = [
        {
          id: '1',
          plate: 'ABC-123',
          model: 'Volvo FH16',
          year: 2020,
          capacity: 25000,
          status: 'AVAILABLE',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Edit Truck')).toBeInTheDocument();
        expect(screen.getByDisplayValue('ABC-123')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Volvo FH16')).toBeInTheDocument();
      });
    });

    test('TC016: Should delete truck when Delete button is confirmed', async () => {
      const mockTrucks = [
        {
          id: '1',
          plate: 'ABC-123',
          model: 'Volvo FH16',
          year: 2020,
          capacity: 25000,
          status: 'AVAILABLE',
        },
      ];

      global.confirm = jest.fn(() => true);

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTrucks,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      render(<TrucksPage />);

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/trucks/1',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });

    test('TC017: Should not delete truck when Delete is cancelled', async () => {
      const mockTrucks = [
        {
          id: '1',
          plate: 'ABC-123',
          model: 'Volvo FH16',
          year: 2020,
          capacity: 25000,
          status: 'AVAILABLE',
        },
      ];

      global.confirm = jest.fn(() => false);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
      });

      // Should only have initial fetch, no delete call
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('TC018: Should handle API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<TrucksPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    test('TC019: Should handle network errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      render(<TrucksPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    test('TC020: Should handle invalid response data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        expect(screen.getByText('No trucks found')).toBeInTheDocument();
      });
    });
  });

  describe('Data Validation', () => {
    test('TC021: Should validate plate number format', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add New Truck');
        fireEvent.click(addButton);
      });

      const plateInput = screen.getByLabelText(/plate number/i);
      await user.type(plateInput, '');

      const submitButton = screen.getByText('Create Truck');
      fireEvent.click(submitButton);

      // Required field validation should prevent submission
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only initial load
    });

    test('TC022: Should validate year is a valid number', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add New Truck');
        fireEvent.click(addButton);
      });

      const yearInput = screen.getByLabelText(/year/i);

      // Year input should only accept numbers
      expect(yearInput).toHaveAttribute('type', 'number');
    });

    test('TC023: Should validate capacity is a positive number', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add New Truck');
        fireEvent.click(addButton);
      });

      const capacityInput = screen.getByLabelText(/capacity/i);

      // Capacity input should only accept numbers
      expect(capacityInput).toHaveAttribute('type', 'number');
      expect(capacityInput).toHaveAttribute('min', '0');
    });
  });

  describe('UI Interactions', () => {
    test('TC024: Should display table headers correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TrucksPage />);

      await waitFor(() => {
        expect(screen.getByText('Plate Number')).toBeInTheDocument();
        expect(screen.getByText('Model')).toBeInTheDocument();
        expect(screen.getByText('Year')).toBeInTheDocument();
        expect(screen.getByText('Capacity (kg)')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });

    test('TC025: Should apply hover effects to truck rows', async () => {
      const mockTrucks = [
        {
          id: '1',
          plate: 'ABC-123',
          model: 'Volvo FH16',
          year: 2020,
          capacity: 25000,
          status: 'AVAILABLE',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrucks,
      });

      render(<TrucksPage />);

      await waitFor(() => {
        const row = screen.getByText('ABC-123').closest('tr');
        expect(row).toHaveClass('hover:bg-blue-50');
      });
    });
  });
});
