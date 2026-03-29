const Reminder = require('../models/Reminder');

const getReminders = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const reminders = await Reminder.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createReminder = async (req, res) => {
  try {
    const { title, type, description, time, days, dosage } = req.body;

    if (!title || !type || !time) {
      return res.status(400).json({ success: false, message: 'Title, type, and time are required.' });
    }

    const reminder = await Reminder.create({ title, type, description, time, days, dosage });
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndDelete(id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    res.json({ success: true, message: 'Reminder deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReminders, createReminder, updateReminder, deleteReminder, toggleReminder };
