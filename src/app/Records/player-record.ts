export class PlayerRecord {

  public poolId: number;
  public poolNumber: number;
  public playerId: number;
  public teamId: number;
  public wins: number;
  public losses: number;
  public totalDiff: number;
  public playoffSeed: number;


  constructor(
    poolId: number,
    poolNumber: number,
    playerId: number,
    teamId: number
  ) {

    this.poolId = poolId;
    this.poolNumber = poolNumber;
    this.playerId = playerId;
    this.teamId = teamId;
    this.wins = 0;
    this.losses = 0;
    this.totalDiff = 0;
    this.playoffSeed = null;
  }
}
