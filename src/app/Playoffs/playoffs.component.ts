import { Component, OnInit } from "@angular/core";
import { PlayerService } from "../Players/player.service";
import { TournamentService } from "../Tournaments/tournament.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { BracketService } from "../Brackets/bracket.service";

@Component({
    templateUrl: 'playoffs.component.html'
})
export class PlayoffsComponent implements OnInit{
    constructor(private ps: PlayerService, public bs: BracketService, private ts: TournamentService, private http: HttpClient, private router: Router, private active_route: ActivatedRoute) {
    }

    public players = [];
    public playoffId: any;
    public playoff = {};
    public bracketSize = 0;
    public numberOfRounds = 0;
    public filledGameIndices = [];
    public bracket: any;
    public playInRound: any;
    public restOfRounds = [];

    

    ngOnInit() {
        this.ps.getPlayers().subscribe((players) => {
            this.players = players;
            this.playoffId = this.active_route.snapshot.paramMap.get('id');
            this.ts.getPlayoff(this.playoffId).subscribe((playoff) => {
                this.playoff = playoff;
                this.bracket = playoff['bracket'];
                this.playInRound = this.bracket.shift();
               //this.bufferDivs();
                console.log(this.playInRound);
                console.log(this.bracket);
                console.log(this.playInRound);
            });
        });
    }

    bufferDivs() {
        for (let i = 0; i < this.bracket[0].length / 2; i++) {
            if (!this.isEmpty(this.bracket[0][2 * i]) && !this.isEmpty(this.bracket[0][(2 * i) + 1])) {
                this.playInRound.splice(2 * i, 0, {});
                this.playInRound.splice((2 * i) + 1, 0, {});
            }
        }
    }

    advancePlayer() {
        this.router.navigateByUrl
        if (round === 0) {
            let openSpotNumber = Math.ceil(this.playInRound.indexOf(player) / 2);
            let openSpotCount = 0;
            let i = 0;
            while (openSpotCount < openSpotNumber) {
                if (this.isEmpty(this.bracket[0][i])) {
                    openSpotCount ++;
                }
                i ++;
            }
            this.bracket[0][i] = player;
        } else {
            console.log('not round 1!')
        }
        console.log(this.bracket);
    }

    returnPlayInPlayer(advance: boolean) {
        let player = this.playInRound.shift();
        let seed = player.playoffSeed;
        seed = seed.toString();
        let name = this.convertToName(player.playerId);
        let bracketString = seed + ' ' + name;
        this.playInRound.push(player);
        return bracketString;
    }

    isEmpty(obj) {
        return JSON.stringify(obj) === '{}';
    }

    returnPower(i): number {
        return Math.pow(2, i);
    }

    indexArray(n: number): any[] {
        return Array(n);
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; 
    }

    isPowerOfTwo(x) {
        return (Math.log(x)/Math.log(2)) % 1 === 0;
    }

    convertToName(id) {
        return this.players.find((player) => player.id == id).name
    }
}