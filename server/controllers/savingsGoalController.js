import SavingsGoal from '../models/SavingsGoal.js'
import SavingsGoalContribution from '../models/SavingsGoalContribution.js'
import Account from '../models/Account.js'

// 1. Create a goal
export const createGoal = async (req, res) => {
  try {
    const { name, description, targetAmount, deadline, icon, color } = req.body

    if (!name || !targetAmount) {
      return res.status(400).json({ success: false, message: 'Name and Target Amount are required.' })
    }

    if (targetAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Target amount must be greater than 0.' })
    }

    // Check duplicate name
    const existing = await SavingsGoal.findOne({
      userId: req.userId,
      name: name.trim(),
      status: 'active',
    })

    if (existing) {
      return res.status(400).json({ success: false, message: 'A goal with this name already exists.' })
    }

    if (deadline && new Date(deadline) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Deadline must be in the future.' })
    }

    const goal = new SavingsGoal({
      userId: req.userId,
      name: name.trim(),
      description: description ? description.trim() : '',
      targetAmount,
      currentAmount: 0,
      deadline: deadline ? new Date(deadline) : undefined,
      icon: icon || 'Shield',
      color: color || '#2563EB',
      status: 'active',
    })

    await goal.save()

    return res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      goal,
    })
  } catch (error) {
    console.error(`Error in createGoal: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error creating savings goal.' })
  }
}

// 2. Retrieve goals list
export const getGoals = async (req, res) => {
  try {
    const goalsRaw = await SavingsGoal.find({ userId: req.userId })
      .sort({ createdAt: -1 })

    const goals = goalsRaw.map((g) => {
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount)
      const progressPercentage = Math.round((g.currentAmount / g.targetAmount) * 100)
      
      return {
        id: g._id.toString(),
        name: g.name,
        description: g.description,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remainingAmount,
        progressPercentage,
        deadline: g.deadline,
        icon: g.icon,
        color: g.color,
        status: g.status,
      }
    })

    return res.status(200).json({
      success: true,
      goals,
    })
  } catch (error) {
    console.error(`Error in getGoals: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error retrieving savings goals.' })
  }
}

// 3. Retrieve single goal by ID
export const getGoalById = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId })
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found.' })
    }

    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount)
    const progressPercentage = Math.round((goal.currentAmount / goal.targetAmount) * 100)

    // Calculate deadline projections
    let daysRemaining = null
    let monthsRemaining = null
    let requiredMonthlySaving = 0
    let statusInsight = 'No Deadline'

    if (goal.deadline) {
      const today = new Date()
      const diffTime = new Date(goal.deadline) - today
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
      monthsRemaining = Math.max(0, parseFloat((daysRemaining / 30.44).toFixed(1)))

      if (remainingAmount === 0) {
        statusInsight = 'Completed'
      } else if (monthsRemaining > 0) {
        requiredMonthlySaving = Math.round(remainingAmount / monthsRemaining)
        
        // Sum user's contributions in the last 90 days and divide by 3 to estimate pace
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        const recentContribs = await SavingsGoalContribution.aggregate([
          { $match: { userId: req.userId, date: { $gte: ninetyDaysAgo } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
        const totalRecent = recentContribs[0]?.total || 0
        const avgMonthlySaving = totalRecent / 3

        if (avgMonthlySaving >= requiredMonthlySaving) {
          statusInsight = 'On Track'
        } else {
          statusInsight = 'Behind'
        }
      } else {
        statusInsight = 'Behind'
        requiredMonthlySaving = remainingAmount
      }
    } else {
      if (remainingAmount === 0) {
        statusInsight = 'Completed'
      }
    }

    return res.status(200).json({
      success: true,
      goal: {
        id: goal._id.toString(),
        name: goal.name,
        description: goal.description,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        remainingAmount,
        progressPercentage,
        deadline: goal.deadline,
        icon: goal.icon,
        color: goal.color,
        status: goal.status,
        daysRemaining,
        monthsRemaining,
        requiredMonthlySaving,
        statusInsight,
      },
    })
  } catch (error) {
    console.error(`Error in getGoalById: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error retrieving savings goal.' })
  }
}

// 4. Update goal meta properties
export const updateGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId })
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found.' })
    }

    const { name, description, targetAmount, deadline, icon, color } = req.body

    if (name && name.trim() !== goal.name) {
      const duplicate = await SavingsGoal.findOne({
        userId: req.userId,
        name: name.trim(),
        status: 'active',
      })
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'A goal with this name already exists.' })
      }
      goal.name = name.trim()
    }

    if (description !== undefined) goal.description = description.trim()
    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Target must be positive.' })
      }
      goal.targetAmount = targetAmount
    }
    if (deadline !== undefined) {
      goal.deadline = deadline ? new Date(deadline) : undefined
    }
    if (icon) goal.icon = icon
    if (color) goal.color = color

    // Recalculate status in case target amount changed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed'
    } else if (goal.status === 'completed') {
      goal.status = 'active'
    }

    await goal.save()

    return res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully',
      goal,
    })
  } catch (error) {
    console.error(`Error in updateGoal: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error updating savings goal.' })
  }
}

// 5. Delete goal and cascade delete contributions
export const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId })
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found.' })
    }

    await SavingsGoalContribution.deleteMany({ goalId: goal._id })
    await SavingsGoal.deleteOne({ _id: goal._id })

    return res.status(200).json({
      success: true,
      message: 'Savings goal and contributions deleted successfully.',
    })
  } catch (error) {
    console.error(`Error in deleteGoal: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error deleting savings goal.' })
  }
}

// 6. Add contribution to a goal
export const addContribution = async (req, res) => {
  try {
    const { amount, date, accountId, notes } = req.body
    const goalId = req.params.id

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' })
    }

    // Verify Goal belongs to user
    const goal = await SavingsGoal.findOne({ _id: goalId, userId: req.userId })
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found.' })
    }

    // Verify Account belongs to user
    const account = await Account.findOne({ _id: accountId, userId: req.userId })
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    const contribution = new SavingsGoalContribution({
      userId: req.userId,
      goalId: goal._id,
      amount,
      date: date ? new Date(date) : undefined,
      accountId,
      notes: notes ? notes.trim() : '',
    })

    await contribution.save()

    // Recalculate goal current balance
    const sumResult = await SavingsGoalContribution.aggregate([
      { $match: { goalId: goal._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const totalSaved = sumResult[0]?.total || 0
    goal.currentAmount = totalSaved
    if (totalSaved >= goal.targetAmount) {
      goal.status = 'completed'
    }

    await goal.save()

    return res.status(201).json({
      success: true,
      message: 'Contribution logged successfully.',
      contribution,
    })
  } catch (error) {
    console.error(`Error in addContribution: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error logging contribution.' })
  }
}

// 7. Get contributions history for a goal
export const getContributions = async (req, res) => {
  try {
    const contributionsRaw = await SavingsGoalContribution.find({ goalId: req.params.id, userId: req.userId })
      .populate('accountId', 'name')
      .sort({ date: -1 })

    const contributions = contributionsRaw.map((c) => ({
      id: c._id.toString(),
      amount: c.amount,
      date: c.date,
      accountName: c.accountId?.name || 'Deleted Account',
      notes: c.notes,
    }))

    return res.status(200).json({
      success: true,
      contributions,
    })
  } catch (error) {
    console.error(`Error in getContributions: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error fetching contributions.' })
  }
}

// 8. Delete a goal contribution
export const deleteContribution = async (req, res) => {
  try {
    const { goalId, contributionId } = req.params

    const contrib = await SavingsGoalContribution.findOne({ _id: contributionId, goalId, userId: req.userId })
    if (!contrib) {
      return res.status(404).json({ success: false, message: 'Contribution not found.' })
    }

    await SavingsGoalContribution.deleteOne({ _id: contrib._id })

    // Recalculate goal
    const goal = await SavingsGoal.findOne({ _id: goalId, userId: req.userId })
    if (goal) {
      const sumResult = await SavingsGoalContribution.aggregate([
        { $match: { goalId: goal._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      const totalSaved = sumResult[0]?.total || 0
      goal.currentAmount = totalSaved
      
      if (totalSaved < goal.targetAmount && goal.status === 'completed') {
        goal.status = 'active'
      }
      await goal.save()
    }

    return res.status(200).json({
      success: true,
      message: 'Contribution deleted successfully.',
    })
  } catch (error) {
    console.error(`Error in deleteContribution: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error deleting contribution.' })
  }
}

// 9. Status Control: Pause Goal
export const pauseGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId })
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' })

    goal.status = 'paused'
    await goal.save()
    return res.status(200).json({ success: true, message: 'Goal paused successfully.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// 10. Status Control: Resume Goal
export const resumeGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId })
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' })

    goal.status = goal.currentAmount >= goal.targetAmount ? 'completed' : 'active'
    await goal.save()
    return res.status(200).json({ success: true, message: 'Goal resumed successfully.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// 11. Status Control: Reopen Goal
export const reopenGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId })
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' })

    goal.status = 'active'
    await goal.save()
    return res.status(200).json({ success: true, message: 'Goal reopened successfully.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// 12. Retrieve Goal Summary Aggregations
export const getSummary = async (req, res) => {
  try {
    const allGoals = await SavingsGoal.find({ userId: req.userId })
    const totalGoals = allGoals.length
    const activeGoals = allGoals.filter((g) => g.status === 'active').length
    const completedGoals = allGoals.filter((g) => g.status === 'completed').length
    
    const totalTargetAmount = allGoals.reduce((sum, g) => sum + g.targetAmount, 0)
    const totalSavedAmount = allGoals.reduce((sum, g) => sum + g.currentAmount, 0)
    const overallProgress = totalTargetAmount > 0 ? Math.round((totalSavedAmount / totalTargetAmount) * 100) : 0

    return res.status(200).json({
      success: true,
      summary: {
        totalGoals,
        activeGoals,
        completedGoals,
        totalTargetAmount,
        totalSavedAmount,
        overallProgress,
      },
    })
  } catch (error) {
    console.error(`Error in getSummary: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error fetching goals summary.' })
  }
}
