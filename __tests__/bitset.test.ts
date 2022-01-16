import BitSet from '../src/BitSet';

describe('Bitset tests', () => {
  it('Should create bitset', () => {
    const bitset = new BitSet();
    expect(bitset).toBeDefined();
  });

  it('Should create empty set', () => {
    const b = new BitSet();
    expect(b.words).toHaveLength(0);
  });

  it('Init by values', () => {
    const b0 = new BitSet([0, 15, 31]);
    expect(b0.words[0]).toBe(0b10000000000000001000000000000001);
    const b1 = new BitSet([32, 47, 63]);
    expect(b1.words[1]).toBe(0b10000000000000001000000000000001);
    const b2 = new BitSet([0, 15, 31, 32, 47, 63]);
    expect(b2.words[0]).toBe(0b10000000000000001000000000000001);
    expect(b2.words[1]).toBe(0b10000000000000001000000000000001);
  });

  it('Is bitset contain value', () => {
    const b = new BitSet([0, 15, 31, 32, 47, 63]);
    expect(b.has(0)).toBeTruthy();
    expect(b.has(15)).toBeTruthy();
    expect(b.has(31)).toBeTruthy();
    expect(b.has(32)).toBeTruthy();
    expect(b.has(47)).toBeTruthy();
    expect(b.has(63)).toBeTruthy();
    expect(b.has(1)).toBeFalsy();
    expect(b.has(16)).toBeFalsy();
    expect(b.has(30)).toBeFalsy();
    expect(b.has(46)).toBeFalsy();
    expect(b.has(62)).toBeFalsy();
  });

  it('Should intersects', () => {
    const b0 = new BitSet([0, 15, 31, 32, 47, 63]);
    const b1 = new BitSet([0, 15, 31, 32, 47, 63]);
    expect(b0.intersects(b1)).toBeTruthy();
    const b2 = new BitSet([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const b3 = new BitSet([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(b2.intersects(b3)).toBeTruthy();
    const b4 = new BitSet([0, 2, 4, 8, 16, 32, 64, 128]);
    const b5 = new BitSet([0, 2, 4, 8, 16, 32, 64, 128]);
    expect(b4.intersects(b5)).toBeTruthy();
    const b6 = new BitSet();
    const b7 = new BitSet([0, 1, 2]);
    expect(b6.intersects(b7)).toBeTruthy();
    const b8 = new BitSet([0, 2, 4, 8, 16, 32, 64, 128]);
    const b9 = new BitSet([0, 2, 4, 8, 16, 32, 64, 128]);
    expect(b8.intersects(b9)).toBeTruthy();
  });

  it('Should not intersects', () => {
    const b0 = new BitSet([0, 63]);
    const b1 = new BitSet([1, 63]);
    expect(b0.intersects(b1)).toBeFalsy();
    const b2 = new BitSet([0, 2, 4, 6, 8, 10, 12]);
    const b3 = new BitSet([1, 3, 5, 7, 9, 11, 13]);
    expect(b2.intersects(b3)).toBeFalsy();
  });

  it('Should add value', () => {
    const b = new BitSet([31]);
    b.add(1);
    expect(b.has(1)).toBeTruthy();
    b.add(32);
    expect(b.has(32)).toBeTruthy();
    b.add(128);
    expect(b.has(128)).toBeTruthy();
    expect(b.words[0]).toBe(0b10000000000000000000000000000010); // 1,31
    expect(b.words[1]).toBe(0b00000000000000000000000000000001); // 32
    expect(b.words[4]).toBe(0b00000000000000000000000000000001); // 128
  });

  it('Should remove value', () => {
    const b = new BitSet([0, 2, 4, 8, 16, 32, 64, 128]);
    b.remove(2);
    expect(b.has(2)).toBeFalsy();
    b.remove(8);
    expect(b.has(8)).toBeFalsy();
    b.remove(32);
    expect(b.has(32)).toBeFalsy();
    b.remove(128);
    expect(b.has(128)).toBeFalsy();
    expect(b.words[0]).toBe(0b00000000000000010000000000010001); // 0,4,16
    expect(b.words[1]).toBe(0);
    expect(b.words[2]).toBe(0b00000000000000000000000000000001); // 64
    expect(b.words[4]).toBe(0);
  });
});
