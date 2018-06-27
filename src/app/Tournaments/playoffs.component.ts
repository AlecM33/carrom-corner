import { Component, OnInit } from "@angular/core";
import { PlayerService } from "../Players/player.service";
import { TournamentService } from "./tournament.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
    templateUrl: 'playoffs.component.html'
})
export class PlayoffsComponent implements OnInit{
    constructor(private ps: PlayerService, private ts: TournamentService, private http: HttpClient, private router: Router, private active_route: ActivatedRoute) {
    }

    public players = [];
    public playoffId: any;
    public playIns = [];
    public byePlayers = [];
    public firstRound = [];
    public bracketSize = 0;
    public numberOfRounds = 0;
    public filledGameIndices = [];

    returnPower(i): number {
        return Math.pow(2, i);
    }

    ngOnInit() {
        this.ps.getPlayers().subscribe((players) => this.players = players);
        this.playoffId = this.active_route.snapshot.paramMap.get('id');
        this.ts.getPlayoff(this.playoffId).subscribe((playoff) => {
            this.byePlayers = playoff['byePlayers'];
            this.playIns = playoff['playIns'];
            this.firstRound = playoff['firstRound'];
            this.bracketSize = this.byePlayers.length + this.playIns.length + this.firstRound.length;

            console.log(this.byePlayers);
            console.log(this.playIns);
            console.log(this.firstRound);

            // Get the power of two corresponding to the first round that is not a play-in
            while (!this.powerOfTwo(this.bracketSize)) {
                this.bracketSize --;
            }

            // If there is no need for a play-in round, the first future round will be a power of 2 smaller
            if (this.firstRound.length > 0 || this.byePlayers.length > this.playIns.length) {
                this.bracketSize /= 2;
            }

            // calculate number of future rounds past the first
            for (let i = this.bracketSize; i > 1; i = i / 2) {
                this.numberOfRounds ++;
            }
        })
    }

    indexArray(n: number): any[] {
        return Array(n);
    }

    
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; 
    }

    powerOfTwo(x) {
        return (Math.log(x)/Math.log(2)) % 1 === 0;
    }

    convertToName(id) {
        return this.players.find((player) => player.id == id).name
    }
}