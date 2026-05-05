export const STORAGE_KEYS = {
  auth: 'myapp_auth',
};

export const BOOKING_TABS = ['upcoming', 'completed', 'cancelled'];

export const STATUS_BY_TAB = {
  upcoming: ['pending', 'accepted', 'in_progress'],
  completed: ['completed'],
  cancelled: ['cancelled', 'rejected'],
};

export const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export const SERVICES_CATALOG = [
  {
    id: 'svc-1',
    title: 'Painting House Walls',
    category: 'Painting',
    provider: 'Brooklyn Simmons',
    price: 22,
    rating: 4.8,
    district: 'Colombo',
    popularity: 95,
    image: 'https://images.unsplash.com/photo-1581579188869-4f24f15ddf4c?auto=format&fit=crop&w=900&q=80',
    options: ['Size of house', 'Paint finish', 'Color count'],
  },
  {
    id: 'svc-2',
    title: 'Laundry Services',
    category: 'Laundry',
    provider: 'Jenny Cooper',
    price: 21,
    rating: 4.5,
    district: 'Gampaha',
    popularity: 76,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    options: ['Weight class', 'Ironing service', 'Fragrance'],
  },
  {
    id: 'svc-3',
    title: 'Appliance Services',
    category: 'Appliance',
    provider: 'Cameron Williamson',
    price: 26,
    rating: 4.2,
    district: 'Kandy',
    popularity: 61,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
    options: ['Working machine', 'Issue type', 'Urgency'],
  },
  {
    id: 'svc-4',
    title: 'Plumbing Repairing',
    category: 'Plumbing',
    provider: 'Theresa Webb',
    price: 27,
    rating: 4.9,
    district: 'Colombo',
    popularity: 97,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80',
    options: ['Water points', 'Damage observed', 'Need spare parts'],
  },
  {
    id: 'svc-5',
    title: 'House Shifting',
    category: 'Shifting',
    provider: 'Courtney Henry',
    price: 32,
    rating: 4.4,
    district: 'Matara',
    popularity: 58,
    image: 'https://images.unsplash.com/photo-1628191018452-54f384f5f6fd?auto=format&fit=crop&w=900&q=80',
    options: ['Origin', 'Destination', 'Large items'],
  },
];

export const DEFAULT_BOOKINGS = [
  {
    _id: 'bk-1',
    serviceTitle: 'Plumbing Repair',
    providerName: 'Theresa Webb',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
    address: '237 New Avenue Park, New York',
    amount: 27,
    notes: 'Leak under kitchen sink',
    isReviewed: false,
  },
  {
    _id: 'bk-2',
    serviceTitle: 'Home Cleaning',
    providerName: 'Gorge Cleaning',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    address: '64 Kind Circle, New York',
    amount: 31,
    notes: 'Deep clean for living room',
    isReviewed: false,
  },
  {
    _id: 'bk-3',
    serviceTitle: 'Laundry Services',
    providerName: 'Jenny Cooper',
    status: 'cancelled',
    scheduledAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    address: '44 Main Street, New York',
    amount: 21,
    notes: '',
    isReviewed: false,
  },
];

export const CHAT_THREADS = [
  { id: 'th-1', name: 'Jenny Wilson', lastMessage: 'I have reached your house', time: '10:14 AM' },
  { id: 'th-2', name: 'Alfonso Schueler', lastMessage: 'Can we move to 4 PM?', time: '09:20 AM' },
  { id: 'th-3', name: 'Benny Jacobsen', lastMessage: 'Order accepted', time: 'Yesterday' },
  { id: 'th-4', name: 'Kyle Denesik', lastMessage: 'Technician assigned', time: 'Yesterday' },
];

export const CHAT_MESSAGES = {
  'th-1': [
    { from: 'other', text: 'Hi, I am near your home now.', time: '10:01 AM' },
    { from: 'me', text: 'Please call once you arrive.', time: '10:05 AM' },
  ],
};
