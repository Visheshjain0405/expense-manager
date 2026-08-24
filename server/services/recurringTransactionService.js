import RecurringTransaction from '../models/RecurringTransaction.js'
import Transaction from '../models/Transaction.js'

export const calculateNextDueDate = (currentDate, frequency, interval) => {
  const next = new Date(currentDate)
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval)
      break
    case 'weekly':
      next.setDate(next.getDate() + interval * 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + interval)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval)
      break
    default:
      break
  }
  return next
}

export const processRecurringTransactions = async () => {
  console.log('Running recurring transaction scheduler job...')
  const now = new Date()

  try {
    // 1. Fetch active templates due
    const activeTemplates = await RecurringTransaction.find({
      status: 'active',
      nextDueDate: { $lte: now },
    })

    console.log(`Found ${activeTemplates.length} recurring schedules due for execution.`)

    for (const schedule of activeTemplates) {
      let currentDueDate = new Date(schedule.nextDueDate)

      // Loop to generate multiple missed occurrences up to today, if applicable
      while (currentDueDate <= now && schedule.status === 'active') {
        const dateStr = currentDueDate.toISOString().substring(0, 10)
        const occurrenceKey = `${schedule.id}_${dateStr}`

        // Check duplicate occurrenceKey to prevent double charges
        const existingTx = await Transaction.findOne({ occurrenceKey })
        if (!existingTx) {
          console.log(`Generating transaction for schedule ${schedule.description} on due date ${dateStr}`)
          
          const newTx = new Transaction({
            userId: schedule.userId,
            type: schedule.type,
            amount: schedule.amount,
            date: new Date(currentDueDate), // Lock exact due date (ignoring generation latency)
            categoryId: schedule.categoryId,
            accountId: schedule.accountId,
            description: schedule.description,
            notes: schedule.notes,
            recurringTransactionId: schedule.id,
            occurrenceKey,
            isRecurring: true,
          })
          
          await newTx.save()
        }

        // Adjust remaining occurrences counter
        if (schedule.occurrencesRemaining !== undefined) {
          schedule.occurrencesRemaining = Math.max(0, schedule.occurrencesRemaining - 1)
          if (schedule.occurrencesRemaining === 0) {
            schedule.status = 'completed'
          }
        }

        // Adjust next due date
        const nextDate = calculateNextDueDate(currentDueDate, schedule.frequency, schedule.interval)
        
        // Verify end date
        if (schedule.endDate && nextDate > new Date(schedule.endDate)) {
          schedule.status = 'completed'
        }

        schedule.nextDueDate = nextDate
        schedule.lastGeneratedAt = new Date()

        // If completed or cancelled, break execution loops
        if (schedule.status !== 'active') {
          break
        }

        // Advance loop date for missing occurrences catches
        currentDueDate = new Date(nextDate)
      }

      await schedule.save()
    }

    console.log('Finished recurring transaction scheduler processing.')
  } catch (err) {
    console.error(`Error in processRecurringTransactions scheduler job: ${err.message}`)
  }
}
