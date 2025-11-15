/**
 * Unit Converter Service
 * Handles conversion between different weight and volume units
 * Logic inspired from CLI: products_cli.py convert_variant_qty_to_parent_unit()
 */

class UnitConverter {
  /**
   * Weight conversions to kilogram (base unit)
   */
  static WEIGHT_TO_KG = {
    'kg': 1.0,
    'kilogram': 1.0,
    'kilograms': 1.0,
    'g': 0.001,
    'gram': 0.001,
    'grams': 0.001,
    'gms': 0.001,
    'mg': 0.000001,
    'milligram': 0.000001,
  };

  /**
   * Volume conversions to liter (base unit)
   */
  static VOLUME_TO_L = {
    'l': 1.0,
    'liter': 1.0,
    'litre': 1.0,
    'liters': 1.0,
    'ml': 0.001,
    'milliliter': 0.001,
    'millilitre': 0.001,
    'milliliters': 0.001,
    'pl': 0.00001,
    'mm3': 0.000001,
  };

  /**
   * Supported unit categories
   */
  static UNIT_CATEGORIES = {
    weight: Object.keys(this.WEIGHT_TO_KG),
    volume: Object.keys(this.VOLUME_TO_L),
  };

  /**
   * Convert quantity from one unit to another
   * Supports weight and volume conversions
   * Fallback to 1:1 if units are incompatible
   *
   * @param {number|string} quantity - Quantity to convert
   * @param {string} fromUnit - Source unit
   * @param {string} toUnit - Target unit
   * @returns {number} - Converted quantity
   */
  static convert(quantity, fromUnit, toUnit) {
    // Parse quantity
    let qty = 0;
    try {
      qty = parseFloat(quantity || '0');
    } catch (e) {
      qty = 0;
    }

    // Validation: quantity must be positive
    if (qty <= 0) {
      return 0;
    }

    // Normalize units (lowercase, trim)
    const from = (fromUnit || '').trim().toLowerCase();
    const to = (toUnit || '').trim().toLowerCase();

    // Handle same unit (no conversion needed)
    if (from === to) {
      return qty;
    }

    // Weight conversions
    if (from in this.WEIGHT_TO_KG && to in this.WEIGHT_TO_KG) {
      const qtyInKg = qty * this.WEIGHT_TO_KG[from];
      return qtyInKg / this.WEIGHT_TO_KG[to];
    }

    // Volume conversions
    if (from in this.VOLUME_TO_L && to in this.VOLUME_TO_L) {
      const qtyInL = qty * this.VOLUME_TO_L[from];
      return qtyInL / this.VOLUME_TO_L[to];
    }

    // Fallback: treat as same unit (1:1 conversion)
    console.warn(`Unit conversion: Unknown unit pair [${from} -> ${to}], using 1:1 conversion`);
    return qty;
  }

  /**
   * Check if unit is valid
   * @param {string} unit - Unit to validate
   * @returns {boolean} - True if unit is valid
   */
  static isValidUnit(unit) {
    if (!unit) return false;
    const normalized = unit.trim().toLowerCase();
    return normalized in this.WEIGHT_TO_KG || normalized in this.VOLUME_TO_L;
  }

  /**
   * Get unit category (weight or volume)
   * @param {string} unit - Unit to check
   * @returns {string|null} - 'weight', 'volume', or null
   */
  static getUnitCategory(unit) {
    if (!unit) return null;
    const normalized = unit.trim().toLowerCase();
    
    if (normalized in this.WEIGHT_TO_KG) return 'weight';
    if (normalized in this.VOLUME_TO_L) return 'volume';
    return null;
  }

  /**
   * Check if two units are compatible (same category)
   * @param {string} unit1 - First unit
   * @param {string} unit2 - Second unit
   * @returns {boolean} - True if units are compatible
   */
  static areUnitsCompatible(unit1, unit2) {
    const cat1 = this.getUnitCategory(unit1);
    const cat2 = this.getUnitCategory(unit2);
    return cat1 === cat2 && cat1 !== null;
  }

  /**
   * Get conversion factor between two units
   * @param {string} fromUnit - Source unit
   * @param {string} toUnit - Target unit
   * @returns {number|null} - Conversion factor or null if incompatible
   */
  static getConversionFactor(fromUnit, toUnit) {
    const from = (fromUnit || '').trim().toLowerCase();
    const to = (toUnit || '').trim().toLowerCase();

    if (from in this.WEIGHT_TO_KG && to in this.WEIGHT_TO_KG) {
      return this.WEIGHT_TO_KG[from] / this.WEIGHT_TO_KG[to];
    }

    if (from in this.VOLUME_TO_L && to in this.VOLUME_TO_L) {
      return this.VOLUME_TO_L[from] / this.VOLUME_TO_L[to];
    }

    return null;
  }

  /**
   * Get all supported units
   * @returns {Object} - Supported units by category
   */
  static getSupportedUnits() {
    return {
      weight: {
        units: Object.keys(this.WEIGHT_TO_KG),
        baseUnit: 'kg',
        description: 'Weight units',
      },
      volume: {
        units: Object.keys(this.VOLUME_TO_L),
        baseUnit: 'l',
        description: 'Volume units',
      },
    };
  }

  /**
   * Normalize unit string to standard format
   * @param {string} unit - Unit to normalize
   * @returns {string} - Normalized unit
   */
  static normalizeUnit(unit) {
    if (!unit) return '';
    return unit.trim().toLowerCase();
  }

  /**
   * Get unit display name (human-readable)
   * @param {string} unit - Unit to get name for
   * @returns {string} - Display name
   */
  static getUnitDisplayName(unit) {
    const normalized = this.normalizeUnit(unit);
    const displayNames = {
      'kg': 'Kilogram',
      'kilogram': 'Kilogram',
      'g': 'Gram',
      'gram': 'Gram',
      'gms': 'Gram',
      'l': 'Liter',
      'liter': 'Liter',
      'litre': 'Liter',
      'ml': 'Milliliter',
      'milliliter': 'Milliliter',
    };
    return displayNames[normalized] || unit;
  }
}

module.exports = UnitConverter;

