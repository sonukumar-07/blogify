const Notification = require('../models/Notification');

async function list(req, res, next) {
  try {
    const items = await Notification.find({ user: req.user.id }).sort('-createdAt').limit(50);
    res.json({ notifications: items });
  } catch (e) { next(e); }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    const notif = await Notification.findOneAndUpdate({ _id: id, user: req.user.id }, { read: true }, { new: true });
    res.json({ notification: notif });
  } catch (e) { next(e); }
}

module.exports = { list, markRead };



