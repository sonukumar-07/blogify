const slugify = require('slugify');
const Category = require('../models/Category');

async function list(req, res, next) {
  try {
    const cats = await Category.find().sort('name');
    res.json({ categories: cats });
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) { res.status(400); throw new Error('name required'); }
    const slug = slugify(name, { lower: true, strict: true });
    const cat = await Category.create({ name, slug, description });
    res.status(201).json({ category: cat });
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const { id } = req.params; const { name, description } = req.body;
    const updates = { description };
    if (name) { updates.name = name; updates.slug = slugify(name, { lower: true, strict: true }); }
    const cat = await Category.findByIdAndUpdate(id, updates, { new: true });
    res.json({ category: cat });
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
}

module.exports = { list, create, update, remove };



