import { useState } from 'react';
import { CreateRoomForm } from '@/types/auction';

interface CreateRoomProps {
  onCreateRoom: (form: CreateRoomForm) => void;
  onBack: () => void;
}

export default function CreateRoom({ onCreateRoom, onBack }: CreateRoomProps) {
  const [form, setForm] = useState<CreateRoomForm>({
    name: '',
    startTime: '',
    endTime: '',
    startBid: '',
    minimumIncrement: '0.01'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.startTime || !form.endTime || !form.startBid) {
      alert('Please fill in all required fields');
      return;
    }

    const startTime = new Date(form.startTime);
    const endTime = new Date(form.endTime);

    if (startTime >= endTime) {
      alert('End time must be after start time');
      return;
    }

    onCreateRoom(form);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Rooms
          </button>
          <header className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Auction Room
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Set up your auction details and start accepting bids
            </p>
          </header>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auction Room Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Vintage Watch Auction"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Starting Bid (ETH) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.startBid}
                  onChange={(e) => setForm(prev => ({ ...prev, startBid: e.target.value }))}
                  placeholder="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Increment (ETH) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={form.minimumIncrement}
                  onChange={(e) => setForm(prev => ({ ...prev, minimumIncrement: e.target.value }))}
                  placeholder="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                Create Auction Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}