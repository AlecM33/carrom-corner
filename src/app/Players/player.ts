// The player model

export class Player {

    public id: number;
    public name: string;
    public nickname: string;
    public tournamentWins: number;

    constructor(name: string,
                nickname: string = '') {

        this.id = null;
        this.name = name;
        this.nickname = nickname;
        this.tournamentWins = 0;

    }
}
