const TaxCalculation = require("../models/TaxCalculation");
const Property = require("../models/Property");

// @desc    Get all tax calculations for a user
// @route   GET /api/tax-calculations
// @access  Private
exports.getTaxCalculations = async (req, res) => {
  try {
    const taxCalculations = await TaxCalculation.find({ user: req.user.id })
      .populate("property")
      .sort({ calculatedAt: -1 });

    res.status(200).json({
      success: true,
      count: taxCalculations.length,
      data: taxCalculations,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Get single tax calculation
// @route   GET /api/tax-calculations/:id
// @access  Private
exports.getTaxCalculation = async (req, res) => {
  try {
    const taxCalculation = await TaxCalculation.findById(req.params.id).populate("property");

    if (!taxCalculation) {
      return res.status(404).json({ error: "Tax calculation not found" });
    }

    // Make sure user owns this calculation
    if (taxCalculation.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    res.status(200).json({
      success: true,
      data: taxCalculation,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Create new tax calculation
// @route   POST /api/tax-calculations
// @access  Private
exports.createTaxCalculation = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Verify property belongs to user
    const property = await Property.findById(req.body.property);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const taxCalculation = await TaxCalculation.create(req.body);

    res.status(201).json({
      success: true,
      data: taxCalculation,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Update tax calculation payment status
// @route   PUT /api/tax-calculations/:id
// @access  Private
exports.updateTaxCalculation = async (req, res) => {
  try {
    let taxCalculation = await TaxCalculation.findById(req.params.id);

    if (!taxCalculation) {
      return res.status(404).json({ error: "Tax calculation not found" });
    }

    // Make sure user owns this calculation
    if (taxCalculation.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    taxCalculation = await TaxCalculation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: taxCalculation,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Delete tax calculation
// @route   DELETE /api/tax-calculations/:id
// @access  Private
exports.deleteTaxCalculation = async (req, res) => {
  try {
    const taxCalculation = await TaxCalculation.findById(req.params.id);

    if (!taxCalculation) {
      return res.status(404).json({ error: "Tax calculation not found" });
    }

    // Make sure user owns this calculation
    if (taxCalculation.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await taxCalculation.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
