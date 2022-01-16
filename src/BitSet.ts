const WORD_SIZE = 32;

export default class BitSet {
  public words = new Uint32Array();

  constructor(values?: Array<number>) {
    if (values) {
      values
        .sort()
        .reverse()
        .forEach((value) => this.add(value));
    }
  }

  has(n: number): boolean {
    const word = Math.floor(n / WORD_SIZE);
    const bit = 1 << (n - word * WORD_SIZE);
    const value = this.words[word] ?? 0;
    return (value & bit) !== 0;
  }

  add(n: number): void {
    const index = Math.floor(n / WORD_SIZE);
    const bit = 1 << (n - index * WORD_SIZE);
    if (index >= this.words.length) {
      const newWords = new Uint32Array(index + 1);
      newWords.fill(0).set(this.words);
      this.words = newWords;
    }
    this.words[index] |= bit;
  }

  remove(n: number): void {
    const index = Math.floor(n / WORD_SIZE);
    const bit = 1 << (n - index * WORD_SIZE);
    this.words[index] &= ~bit;
  }

  intersects(bitset: BitSet): boolean {
    let result = true;
    this.words.forEach((word, index) => {
      const v = bitset.words[index];
      const value = v === undefined ? 0 : v;
      result = result && (value & word) >>> 0 === word;
    });
    return result;
  }
}
