export const summaryData = {
  income: {
    title: 'Total Income',
    value: '₹45,000',
    change: '↑ 12.5%',
    subText: 'vs last month'
  },
  expense: {
    title: 'Total Expenses',
    value: '₹28,450',
    change: '↓ 4.2%',
    subText: 'vs last month'
  },
  balance: {
    title: 'Current Balance',
    value: '₹16,550',
    change: '',
    subText: 'Available balance'
  },
  savingsRate: {
    title: 'Savings Rate',
    value: '36.7%',
    change: '↑ 5.4%',
    subText: 'vs last month'
  }
}

export const incomeExpenseData = {
  '30D': [
    { name: 'Aug 1', Income: 8000, Expenses: 4200 },
    { name: 'Aug 5', Income: 7500, Expenses: 5100 },
    { name: 'Aug 10', Income: 6000, Expenses: 3900 },
    { name: 'Aug 15', Income: 9200, Expenses: 6100 },
    { name: 'Aug 20', Income: 5000, Expenses: 4100 },
    { name: 'Aug 25', Income: 4800, Expenses: 2200 },
    { name: 'Aug 30', Income: 4500, Expenses: 2850 }
  ],
  '7D': [
    { name: 'Mon', Income: 1200, Expenses: 800 },
    { name: 'Tue', Income: 1500, Expenses: 950 },
    { name: 'Wed', Income: 900, Expenses: 1100 },
    { name: 'Thu', Income: 2200, Expenses: 1400 },
    { name: 'Fri', Income: 1800, Expenses: 700 },
    { name: 'Sat', Income: 1400, Expenses: 1200 },
    { name: 'Sun', Income: 800, Expenses: 650 }
  ],
  '6M': [
    { name: 'Mar', Income: 40000, Expenses: 26000 },
    { name: 'Apr', Income: 42000, Expenses: 27500 },
    { name: 'May', Income: 45000, Expenses: 29000 },
    { name: 'Jun', Income: 43000, Expenses: 31000 },
    { name: 'Jul', Income: 46000, Expenses: 28000 },
    { name: 'Aug', Income: 45000, Expenses: 28450 }
  ],
  '1Y': [
    { name: 'Q1', Income: 120000, Expenses: 80000 },
    { name: 'Q2', Income: 135000, Expenses: 89000 },
    { name: 'Q3', Income: 141000, Expenses: 85450 },
    { name: 'Q4', Income: 150000, Expenses: 92000 }
  ]
}

export const expenseBreakdownData = [
  { name: 'Food', value: 6500, color: '#3B82F6' },
  { name: 'Shopping', value: 4800, color: '#EC4899' },
  { name: 'Travel', value: 3200, color: '#F59E0B' },
  { name: 'Bills', value: 2750, color: '#10B981' },
  { name: 'Subscriptions', value: 1200, color: '#8B5CF6' },
  { name: 'Other', value: 10000, color: '#64748B' }
]

export const dailySpendingData = [
  { name: '1 Aug', amount: 450 },
  { name: '3 Aug', amount: 800 },
  { name: '5 Aug', amount: 1200 },
  { name: '7 Aug', amount: 350 },
  { name: '9 Aug', amount: 950 },
  { name: '11 Aug', amount: 620 },
  { name: '13 Aug', amount: 1500 },
  { name: '15 Aug', amount: 480 },
  { name: '17 Aug', amount: 900 },
  { name: '19 Aug', amount: 720 },
  { name: '21 Aug', amount: 1100 },
  { name: '23 Aug', amount: 850 },
  { name: '25 Aug', amount: 640 },
  { name: '27 Aug', amount: 500 },
  { name: '29 Aug', amount: 950 },
  { name: '31 Aug', amount: 400 }
]

export const recentTransactions = [
  {
    id: 1,
    description: 'Dinner',
    category: 'Food',
    paymentMethod: 'UPI',
    date: 'Today',
    type: 'expense',
    amount: -350
  },
  {
    id: 2,
    description: 'Freelance Payment',
    category: 'Freelancing',
    paymentMethod: 'Bank',
    date: 'Yesterday',
    type: 'income',
    amount: 5000
  },
  {
    id: 3,
    description: 'Auto',
    category: 'Travel',
    paymentMethod: 'Cash',
    date: '21 Aug',
    type: 'expense',
    amount: -120
  },
  {
    id: 4,
    description: 'Groceries',
    category: 'Food',
    paymentMethod: 'UPI',
    date: '20 Aug',
    type: 'expense',
    amount: -1450
  },
  {
    id: 5,
    description: 'Netflix Subscription',
    category: 'Subscriptions',
    paymentMethod: 'Card',
    date: '18 Aug',
    type: 'expense',
    amount: -649
  },
  {
    id: 6,
    description: 'Electricity Bill',
    category: 'Bills',
    paymentMethod: 'Card',
    date: '15 Aug',
    type: 'expense',
    amount: -2750
  },
  {
    id: 7,
    description: 'Salary Credited',
    category: 'Salary',
    paymentMethod: 'Bank',
    date: '01 Aug',
    type: 'income',
    amount: 40000
  }
]

export const spendingInsights = {
  highestCategory: {
    category: 'Food',
    value: '₹6,500',
    percent: '22.8% of total expenses'
  },
  largestExpense: {
    title: 'Shopping',
    value: '₹3,200',
    date: '23 Aug'
  },
  averageDaily: {
    value: '₹948',
    subtext: 'This month'
  }
}

export const budgetOverview = [
  { category: 'Food', spent: 4800, limit: 6000 },
  { category: 'Travel', spent: 3200, limit: 4000 },
  { category: 'Shopping', spent: 5400, limit: 5000 }
]
