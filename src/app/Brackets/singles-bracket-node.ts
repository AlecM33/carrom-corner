export class SinglesBracketNode {

  public id: number;
  public bracketId: number;
  public player1Id: number;
  public player2Id: number;
  public seed1: number;
  public seed2: number;
  public nodeIndex: number;

  constructor(
    bracketId: number,
    player1Id: number,
    player2Id: number,
    seed1: number,
    seed2: number,
    nodeIndex: number) {

    this.id = null;
    this.bracketId = bracketId;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.seed1 = seed1;
    this.seed2 = seed2;
    this.nodeIndex = nodeIndex;
  }
}
