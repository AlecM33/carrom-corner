export class SinglesGame {
  public id: number;
  public playoff: boolean;
  public tournamentId: number;
  public roundId: number;
  public poolId: number;
  public player1Id: number;
  public player2Id: number;
  public winner: number;
  public differential: number;

  constructor(
    tournamentId: number,
    roundId: number,
    poolId: number,
    playoff: boolean,
    player1Id: number,
    player2Id: number
  ) {
    this.id = null;
    this.tournamentId = tournamentId;
    this.roundId = roundId;
    this.poolId = poolId;
    this.playoff = playoff;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.winner = null;
    this.differential = null;
  }
}
