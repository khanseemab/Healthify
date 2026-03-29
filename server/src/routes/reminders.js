const express = require('express');
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
} = require('../controllers/reminderController');

const router = express.Router();

router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/toggle', toggleReminder);

module.exports = router;
