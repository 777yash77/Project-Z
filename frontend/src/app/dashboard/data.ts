export interface HrProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  initials: string;
  avatar: string;
  accent: string;
}

export interface TradeEmployee {
  id: number;
  name: string;
  department: string;
  riskLevel: string;
  riskScore: number;
  openForTrade: boolean;
  trackedBy: string[];
  lastUpdated: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface MessageThread {
  participantId: string;
  messages: Message[];
}

const HR_PROFILES_KEY = 'hr-profiles';
const TRADE_EMPLOYEES_KEY = 'trade-employees';
const MESSAGES_KEY = 'hr-messages';
const CURRENT_HR_KEY = 'current-hr-id';

const defaultHrProfiles: HrProfile[] = [
  {
    id: 'maya',
    name: 'Maya Cole',
    role: 'HR Lead',
    department: 'People Operations',
    location: 'Seattle, US',
    initials: 'MC',
    avatar: '🧑‍💼',
    accent: 'from-rose-500 to-red-600',
  },
  {
    id: 'jules',
    name: 'Jules Grant',
    role: 'Talent Partner',
    department: 'Recruiting',
    location: 'Austin, US',
    initials: 'JG',
    avatar: '👩‍💼',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    id: 'sofia',
    name: 'Sofia Patel',
    role: 'People Partner',
    department: 'Operations',
    location: 'Denver, US',
    initials: 'SP',
    avatar: '🧑‍🔬',
    accent: 'from-zinc-500 to-zinc-700',
  },
];

const defaultTradeEmployees: TradeEmployee[] = [
  { id: 101, name: 'Ava Brooks', department: 'Engineering', riskLevel: 'High', riskScore: 0.88, openForTrade: true, trackedBy: ['maya'], lastUpdated: '2h ago' },
  { id: 102, name: 'Liam Ortiz', department: 'Sales', riskLevel: 'Medium', riskScore: 0.64, openForTrade: true, trackedBy: ['jules'], lastUpdated: '4h ago' },
  { id: 103, name: 'Nina Singh', department: 'Design', riskLevel: 'Low', riskScore: 0.34, openForTrade: false, trackedBy: [], lastUpdated: 'Today' },
];

const defaultMessages: MessageThread[] = [
  {
    participantId: 'jules',
    messages: [
      { id: 'm1', senderId: 'maya', text: 'Can you review the trade candidates for the Austin office?', createdAt: '09:20' },
      { id: 'm2', senderId: 'jules', text: 'Yes, I have two profiles flagged and I will share them shortly.', createdAt: '09:24' },
    ],
  },
  {
    participantId: 'sofia',
    messages: [{ id: 'm3', senderId: 'maya', text: 'I need a quick sync on employee mobility this week.', createdAt: '10:05' }],
  },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getHrProfiles(): HrProfile[] {
  if (!isBrowser()) return defaultHrProfiles;
  const stored = window.localStorage.getItem(HR_PROFILES_KEY);
  if (!stored) {
    window.localStorage.setItem(HR_PROFILES_KEY, JSON.stringify(defaultHrProfiles));
    return defaultHrProfiles;
  }
  return JSON.parse(stored) as HrProfile[];
}

export function getTradeEmployees(): TradeEmployee[] {
  if (!isBrowser()) return defaultTradeEmployees;
  const stored = window.localStorage.getItem(TRADE_EMPLOYEES_KEY);
  if (!stored) {
    window.localStorage.setItem(TRADE_EMPLOYEES_KEY, JSON.stringify(defaultTradeEmployees));
    return defaultTradeEmployees;
  }
  return JSON.parse(stored) as TradeEmployee[];
}

export function saveTradeEmployees(employees: TradeEmployee[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TRADE_EMPLOYEES_KEY, JSON.stringify(employees));
}

export function getMessages(): MessageThread[] {
  if (!isBrowser()) return defaultMessages;
  const stored = window.localStorage.getItem(MESSAGES_KEY);
  if (!stored) {
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(defaultMessages));
    return defaultMessages;
  }
  return JSON.parse(stored) as MessageThread[];
}

export function saveMessages(messages: MessageThread[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getCurrentHrId(): string {
  if (!isBrowser()) return defaultHrProfiles[0].id;
  return window.localStorage.getItem(CURRENT_HR_KEY) ?? defaultHrProfiles[0].id;
}

export function setCurrentHrId(id: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CURRENT_HR_KEY, id);
}

export function getHrProfileById(id: string): HrProfile | undefined {
  return getHrProfiles().find((profile) => profile.id === id);
}
