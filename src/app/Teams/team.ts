import { Player } from "../Players/player";

export class Team {
    public player1: Player;
    public player2: Player;

    constructor(player1: Player, player2: Player) {
        this.player1 = player1;
        this.player2 = player2;
    }
}