// filepath: /Users/gwen/Documents/trademark_scoring/src/tests/dummy.test.ts

describe('Jest basic functionality', () => {
  it('should run a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve('hello');
    expect(result).toBe('hello');
  });
});