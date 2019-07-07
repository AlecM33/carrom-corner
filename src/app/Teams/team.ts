export class Team {
  id: number;
  tournamentId: number;
  player1Id: number;
  player2Id: number;

  constructor(tournamentId: number, player1Id: number, player2Id: number) {
    this.id = null;
    this.tournamentId = tournamentId;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
  }
}
