export class DoublesGame {
  public id: number;
  public playoff: boolean;
  public tournamentId: number;
  public roundId: number;
  public poolId: number;
  public team1Id: number;
  public team2Id: number;
  public winner: number;
  public loser: number;
  public differential: number;
  public validator: number;
  public coinFlipWinner: number;

  constructor(
    tournamentId: number,
    roundId: number,
    poolId: number,
    playoff: boolean,
    team1Id: number,
    team2Id: number
    ) {
    this.id = null;
    this.tournamentId = tournamentId;
    this.roundId = roundId;
    this.poolId = poolId;
    this.playoff = playoff;
    this.team1Id = team1Id;
    this.team2Id = team2Id;
    this.winner = null;
    this.loser = null;
    this.differential = null;
    this.validator = null;
    this.coinFlipWinner = null;
  }
}
