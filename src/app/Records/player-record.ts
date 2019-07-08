export class PlayerRecord {

  public poolId: number;
  public playerId: number;
  public teamId: number;
  public wins: number;
  public losses: number;
  public totalDiff: number;


  constructor(
    poolId: number,
    playerId: number,
    teamId: number
  ) {

    this.poolId = poolId;
    this.playerId = playerId;
    this.teamId = teamId;
    this.wins = 0;
    this.losses = 0;
    this.totalDiff = 0;
  }
}
