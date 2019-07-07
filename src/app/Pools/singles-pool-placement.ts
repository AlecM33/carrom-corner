export class SinglesPoolPlacement {
  id: number;
  poolId: number;
  playerId: number;

  constructor(poolId: number, playerId: number) {
    this.id = null;
    this.poolId = poolId;
    this.playerId = playerId;
  }
}
