const Property = require("../models/Property");

// @desc    Calculate tax using AI
// @route   POST /api/ai/calculate-tax
// @access  Private
exports.calculateTax = async (req, res) => {
  try {
    const { property } = req.body;

    const AI_API_KEY = process.env.AI_API_KEY;
    if (!AI_API_KEY) {
      return res.status(500).json({ error: "AI API key is not configured" });
    }

    const currentYear = new Date().getFullYear();
    const propertyAge = property.construction_year
      ? currentYear - property.construction_year
      : 0;

    const systemPrompt = `You are an expert property tax calculator for Indian municipalities, specifically for Rajasthan state. 
    
You calculate property tax based on:
1. Unit Area Value (UAV) method used in Rajasthan
2. Property type factors: Residential (1.0), Commercial (1.5), Industrial (1.3), Agricultural (0.5), Mixed Use (1.2)
3. Location factors for cities: Jaipur (1.2), Jodhpur (1.0), Udaipur (1.1), Other (0.8)
4. Age depreciation: Properties older than 10 years get 10% reduction, 20+ years get 20% reduction
5. Base rate: ₹5 per sq.ft for residential, ₹8 for commercial

Return your response as a valid JSON object with these exact fields:
{
  "base_tax": <number - base tax amount in INR>,
  "location_factor": <number - multiplier based on city>,
  "property_type_factor": <number - multiplier based on property type>,
  "age_depreciation": <number - percentage reduction for old properties>,
  "total_tax": <number - final calculated tax in INR>,
  "reasoning": "<string - brief explanation of calculation>"
}`;

    const userPrompt = `Calculate property tax for:
- Property Type: ${property.property_type}
- Total Area: ${property.area_sqft} sq.ft
- Built-up Area: ${property.built_up_area_sqft || property.area_sqft} sq.ft
- Property Value: ₹${property.property_value.toLocaleString("en-IN")}
- City: ${property.city}, Rajasthan
- Construction Year: ${property.construction_year || "Unknown"}
- Property Age: ${propertyAge} years
- Number of Floors: ${property.floor_count || 1}

Calculate the annual property tax using UAV method and return the JSON response.`;

    const response = await fetch(
      "https://aigateway.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please try again in a moment.",
        });
      }
      if (response.status === 402) {
        return res.status(402).json({
          error: "AI credits exhausted. Please add funds to continue.",
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return res.status(500).json({ error: `AI gateway error: ${response.status}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "No response from AI" });
    }

    // Parse the JSON response from AI
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Could not parse AI response" });
    }

    const taxCalculation = JSON.parse(jsonMatch[0]);

    res.status(200).json({
      success: true,
      data: taxCalculation,
    });
  } catch (error) {
    console.error("calculate-tax error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    AI Tax Assistant Chat
// @route   POST /api/ai/tax-assistant
// @access  Private
exports.taxAssistant = async (req, res) => {
  try {
    const { question, properties, taxCalculations } = req.body;

    const AI_API_KEY = process.env.AI_API_KEY;
    if (!AI_API_KEY) {
      return res.status(500).json({ error: "AI API key is not configured" });
    }

    const systemPrompt = `You are STMS AI Assistant, an expert on Indian property tax laws, specifically for Rajasthan state. You help citizens understand:
- Property tax calculation methods (Unit Area Value)
- Tax exemptions and rebates
- Payment deadlines and penalties
- Required documents for property registration
- Appeal procedures
- Government schemes for tax relief

Be helpful, concise, and provide actionable advice. If the user has property data, reference it in your answers.`;

    let contextInfo = "";
    if (properties && properties.length > 0) {
      contextInfo += "\n\nUser's Properties:\n";
      properties.forEach((p, i) => {
        contextInfo += `${i + 1}. ${p.property_name} - ${p.property_type}, ${
          p.area_sqft
        } sq.ft, ₹${p.property_value.toLocaleString("en-IN")}, ${p.city}\n`;
      });
    }
    if (taxCalculations && taxCalculations.length > 0) {
      contextInfo += "\n\nRecent Tax Calculations:\n";
      taxCalculations.forEach((t, i) => {
        contextInfo += `${i + 1}. FY ${t.fiscal_year}: ₹${t.total_tax.toLocaleString(
          "en-IN"
        )} (${t.payment_status})\n`;
      });
    }

    const response = await fetch(
      "https://aigateway.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question + contextInfo },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please try again later.",
        });
      }
      if (response.status === 402) {
        return res.status(402).json({
          error: "AI credits exhausted. Please add funds.",
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return res.status(500).json({ error: `AI gateway error: ${response.status}` });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Pipe the response
    response.body.pipe(res);
  } catch (error) {
    console.error("tax-assistant error:", error);
    res.status(500).json({ error: error.message });
  }
};
