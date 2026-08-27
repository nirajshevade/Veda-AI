import { describe, it, expect } from 'vitest';
import { normalizeLabel } from '../normalize';

describe('normalizeLabel', () => {
  it('normalizes basic numerical questions', () => {
    expect(normalizeLabel('1')).toBe('1');
    expect(normalizeLabel('2.')).toBe('2');
    expect(normalizeLabel('Q3')).toBe('3');
    expect(normalizeLabel('Question 4')).toBe('4');
    expect(normalizeLabel('Ans 5')).toBe('5');
    expect(normalizeLabel('Ans: 6')).toBe('6');
    expect(normalizeLabel('Q. 7')).toBe('7');
    expect(normalizeLabel('No. 8')).toBe('8');
  });

  it('normalizes multi-part sub-questions', () => {
    expect(normalizeLabel('11(a)')).toBe('11.a');
    expect(normalizeLabel('11 (a)')).toBe('11.a');
    expect(normalizeLabel('11a')).toBe('11.a');
    expect(normalizeLabel('11-a')).toBe('11.a');
    expect(normalizeLabel('11.a')).toBe('11.a');
    expect(normalizeLabel('11 a')).toBe('11.a');
    expect(normalizeLabel('11 (A)')).toBe('11.a');
    expect(normalizeLabel('Q11(a)')).toBe('11.a');
    expect(normalizeLabel('Ans 11(b)')).toBe('11.b');
    expect(normalizeLabel('11.(b)')).toBe('11.b');
  });

  it('handles null, undefined, or empty strings safely', () => {
    expect(normalizeLabel(null)).toBe('');
    expect(normalizeLabel(undefined)).toBe('');
    expect(normalizeLabel('')).toBe('');
    expect(normalizeLabel('   ')).toBe('');
  });
});
