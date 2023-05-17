import FastBitSet from 'fastbitset';

export default class QueryMask {
  public readonly key: string;

  constructor(public readonly mask: FastBitSet, public readonly notMask: FastBitSet) {
    this.key = `${mask.toString()}-${notMask.toString()}`;
  }

  /**
   * check is entity matches with query
   *
   * @param entityMask - entity mask
   * @returns is entity mask matches with query
   */
  match(entityMask: FastBitSet): boolean {
    return !this.mask.difference_size(entityMask) && !this.notMask.intersection_size(entityMask);
  }

  /**
   *
   * @param queryMask - query mask instance
   * @returns is queries equal
   */
  equal(queryMask: QueryMask): boolean {
    return queryMask.mask.equals(this.mask) && queryMask.notMask.equals(this.notMask);
  }
}
