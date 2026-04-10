const BrandModel = require('../models/brandModel');

const getAllBrands = async (req, res) => {
  try {
    const brands = await BrandModel.findAll();
    res.json({ success: true, count: brands.length, brands });
  } catch (err) {
    console.error('[brandController.getAllBrands]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch brands.' });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Brand name is required.' });
    const id    = await BrandModel.create({ name: name.trim() });
    const brand = await BrandModel.findById(id);
    res.status(201).json({ success: true, message: 'Brand created.', brand });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Brand name already exists.' });
    console.error('[brandController.createBrand]', err);
    res.status(500).json({ success: false, message: 'Failed to create brand.' });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id }   = req.params;
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Brand name is required.' });
    const existing = await BrandModel.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Brand not found.' });
    await BrandModel.update(id, { name: name.trim() });
    const brand = await BrandModel.findById(id);
    res.json({ success: true, message: 'Brand updated.', brand });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Brand name already exists.' });
    console.error('[brandController.updateBrand]', err);
    res.status(500).json({ success: false, message: 'Failed to update brand.' });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const affected = await BrandModel.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false, message: 'Brand not found.' });
    res.json({ success: true, message: 'Brand deleted.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2')
      return res.status(409).json({ success: false, message: 'Cannot delete — products are linked to this brand.' });
    console.error('[brandController.deleteBrand]', err);
    res.status(500).json({ success: false, message: 'Failed to delete brand.' });
  }
};

module.exports = { getAllBrands, createBrand, updateBrand, deleteBrand };
