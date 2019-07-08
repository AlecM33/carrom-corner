export class DoublesGame {
  public id: number;
  public playoff: boolean;
  public tournamentId: number;
  public roundId: number;
  public poolId: number;
  public team1Id: number;
  public team2Id: number;
  public winner: number;
  public differential: number;

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
    this.differential = null;
  }
}
