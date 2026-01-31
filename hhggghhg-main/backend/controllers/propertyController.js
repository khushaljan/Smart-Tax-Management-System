const Property = require("../models/Property");

// @desc    Get all properties for a user
// @route   GET /api/properties
// @access  Private
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Make sure user is property owner
    if (property.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
exports.createProperty = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Make sure user is property owner
    if (property.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Make sure user is property owner
    if (property.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
