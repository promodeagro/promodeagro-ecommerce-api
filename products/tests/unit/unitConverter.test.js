/**
 * Unit Converter Unit Tests
 * Tests for unitConverter.js service
 */

const UnitConverter = require('../../services/unitConverter');

describe('UnitConverter', () => {
  describe('convert()', () => {
    describe('Weight Conversions', () => {
      it('should convert kilograms to grams', () => {
        const result = UnitConverter.convert(1, 'kg', 'g');
        expect(result).toBe(1000);
      });

      it('should convert grams to kilograms', () => {
        const result = UnitConverter.convert(1000, 'g', 'kg');
        expect(result).toBe(1);
      });

      it('should convert 500g to kg', () => {
        const result = UnitConverter.convert(500, 'g', 'kg');
        expect(result).toBe(0.5);
      });

      it('should handle same unit conversion', () => {
        const result = UnitConverter.convert(5, 'kg', 'kg');
        expect(result).toBe(5);
      });

      it('should handle case-insensitive units', () => {
        const result = UnitConverter.convert(1, 'KG', 'gram');
        expect(result).toBe(1000);
      });

      it('should handle unit aliases', () => {
        const result1 = UnitConverter.convert(1, 'kilogram', 'g');
        const result2 = UnitConverter.convert(1, 'kg', 'grams');
        
        expect(result1).toBe(1000);
        expect(result2).toBe(1000);
      });
    });

    describe('Volume Conversions', () => {
      it('should convert liters to milliliters', () => {
        const result = UnitConverter.convert(1, 'l', 'ml');
        expect(result).toBe(1000);
      });

      it('should convert milliliters to liters', () => {
        const result = UnitConverter.convert(1000, 'ml', 'l');
        expect(result).toBe(1);
      });

      it('should convert 500ml to liters', () => {
        const result = UnitConverter.convert(500, 'ml', 'l');
        expect(result).toBe(0.5);
      });

      it('should handle volume unit aliases', () => {
        const result = UnitConverter.convert(1, 'liter', 'milliliter');
        expect(result).toBe(1000);
      });
    });

    describe('Edge Cases', () => {
      it('should return 0 for zero quantity', () => {
        const result = UnitConverter.convert(0, 'kg', 'g');
        expect(result).toBe(0);
      });

      it('should return 0 for negative quantity', () => {
        const result = UnitConverter.convert(-5, 'kg', 'g');
        expect(result).toBe(0);
      });

      it('should return 0 for null quantity', () => {
        const result = UnitConverter.convert(null, 'kg', 'g');
        expect(result).toBe(0);
      });

      it('should handle string quantity input', () => {
        const result = UnitConverter.convert('1', 'kg', 'g');
        expect(result).toBe(1000);
      });

      it('should return quantity for incompatible units', () => {
        const result = UnitConverter.convert(5, 'kg', 'l');
        expect(result).toBe(5); // Fallback to 1:1
      });

      it('should handle decimal quantities', () => {
        const result = UnitConverter.convert(1.5, 'kg', 'g');
        expect(result).toBe(1500);
      });
    });
  });

  describe('isValidUnit()', () => {
    it('should validate weight units', () => {
      expect(UnitConverter.isValidUnit('kg')).toBe(true);
      expect(UnitConverter.isValidUnit('g')).toBe(true);
      expect(UnitConverter.isValidUnit('gram')).toBe(true);
    });

    it('should validate volume units', () => {
      expect(UnitConverter.isValidUnit('l')).toBe(true);
      expect(UnitConverter.isValidUnit('ml')).toBe(true);
      expect(UnitConverter.isValidUnit('liter')).toBe(true);
    });

    it('should reject invalid units', () => {
      expect(UnitConverter.isValidUnit('xyz')).toBe(false);
      expect(UnitConverter.isValidUnit('meters')).toBe(false);
      expect(UnitConverter.isValidUnit('')).toBe(false);
      expect(UnitConverter.isValidUnit(null)).toBe(false);
    });

    it('should handle case-insensitive validation', () => {
      expect(UnitConverter.isValidUnit('KG')).toBe(true);
      expect(UnitConverter.isValidUnit('ML')).toBe(true);
    });
  });

  describe('getUnitCategory()', () => {
    it('should identify weight units', () => {
      expect(UnitConverter.getUnitCategory('kg')).toBe('weight');
      expect(UnitConverter.getUnitCategory('g')).toBe('weight');
      expect(UnitConverter.getUnitCategory('gram')).toBe('weight');
    });

    it('should identify volume units', () => {
      expect(UnitConverter.getUnitCategory('l')).toBe('volume');
      expect(UnitConverter.getUnitCategory('ml')).toBe('volume');
      expect(UnitConverter.getUnitCategory('liter')).toBe('volume');
    });

    it('should return null for invalid units', () => {
      expect(UnitConverter.getUnitCategory('xyz')).toBeNull();
      expect(UnitConverter.getUnitCategory('')).toBeNull();
      expect(UnitConverter.getUnitCategory(null)).toBeNull();
    });
  });

  describe('areUnitsCompatible()', () => {
    it('should identify compatible weight units', () => {
      expect(UnitConverter.areUnitsCompatible('kg', 'g')).toBe(true);
      expect(UnitConverter.areUnitsCompatible('gram', 'kilogram')).toBe(true);
    });

    it('should identify compatible volume units', () => {
      expect(UnitConverter.areUnitsCompatible('l', 'ml')).toBe(true);
      expect(UnitConverter.areUnitsCompatible('liter', 'milliliter')).toBe(true);
    });

    it('should identify incompatible units', () => {
      expect(UnitConverter.areUnitsCompatible('kg', 'l')).toBe(false);
      expect(UnitConverter.areUnitsCompatible('g', 'ml')).toBe(false);
    });

    it('should return false for invalid units', () => {
      expect(UnitConverter.areUnitsCompatible('kg', 'xyz')).toBe(false);
      expect(UnitConverter.areUnitsCompatible('xyz', 'l')).toBe(false);
    });
  });

  describe('getConversionFactor()', () => {
    it('should return conversion factor for weight units', () => {
      const factor = UnitConverter.getConversionFactor('kg', 'g');
      expect(factor).toBe(1000);
    });

    it('should return conversion factor for volume units', () => {
      const factor = UnitConverter.getConversionFactor('l', 'ml');
      expect(factor).toBe(1000);
    });

    it('should return null for incompatible units', () => {
      expect(UnitConverter.getConversionFactor('kg', 'l')).toBeNull();
    });

    it('should return null for invalid units', () => {
      expect(UnitConverter.getConversionFactor('xyz', 'kg')).toBeNull();
    });
  });

  describe('getSupportedUnits()', () => {
    it('should return supported units structure', () => {
      const units = UnitConverter.getSupportedUnits();
      
      expect(units).toHaveProperty('weight');
      expect(units).toHaveProperty('volume');
    });

    it('should include weight units', () => {
      const units = UnitConverter.getSupportedUnits();
      
      expect(units.weight.units).toContain('kg');
      expect(units.weight.units).toContain('g');
      expect(units.weight.baseUnit).toBe('kg');
    });

    it('should include volume units', () => {
      const units = UnitConverter.getSupportedUnits();
      
      expect(units.volume.units).toContain('l');
      expect(units.volume.units).toContain('ml');
      expect(units.volume.baseUnit).toBe('l');
    });
  });

  describe('normalizeUnit()', () => {
    it('should normalize units to lowercase', () => {
      expect(UnitConverter.normalizeUnit('KG')).toBe('kg');
      expect(UnitConverter.normalizeUnit('Kg')).toBe('kg');
    });

    it('should trim whitespace', () => {
      expect(UnitConverter.normalizeUnit(' kg ')).toBe('kg');
      expect(UnitConverter.normalizeUnit('\tkg\n')).toBe('kg');
    });

    it('should return empty string for null', () => {
      expect(UnitConverter.normalizeUnit(null)).toBe('');
      expect(UnitConverter.normalizeUnit(undefined)).toBe('');
    });
  });

  describe('getUnitDisplayName()', () => {
    it('should return display names for weight units', () => {
      expect(UnitConverter.getUnitDisplayName('kg')).toBe('Kilogram');
      expect(UnitConverter.getUnitDisplayName('g')).toBe('Gram');
    });

    it('should return display names for volume units', () => {
      expect(UnitConverter.getUnitDisplayName('l')).toBe('Liter');
      expect(UnitConverter.getUnitDisplayName('ml')).toBe('Milliliter');
    });

    it('should return unit as-is for unknown units', () => {
      expect(UnitConverter.getUnitDisplayName('xyz')).toBe('xyz');
    });
  });
});

