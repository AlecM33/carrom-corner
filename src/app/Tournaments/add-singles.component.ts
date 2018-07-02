import { Component, OnInit, DoCheck } from '@angular/core';
import { AppComponent } from '../app.component';
import { NgModel } from '@angular/forms';
import { AddPlayerComponent } from '../Players/add-player.component'
import { FormsModule } from '@angular/forms'
import { PlayerService } from '../Players/player.service';
import { HttpClient } from '@angular/common/http';
import { Player } from '../Players/player';
import { TournamentService } from './tournament.service';
import { Observable } from 'rxjs/Observable';
import { Tournament } from './tournament';
import { Team } from '../Teams/team';
import { Router } from '@angular/router';
import { Pool } from '../Pools/pool';
import { Game } from '../Games/game';


/* Component for creating a singles tournament. Includes functions for presenting setup parameters
and for generating the pools and schedule */
@Component({
    templateUrl: 'add-singles.component.html'
})
export class AddSinglesComponent implements OnInit {
    constructor(private ps: PlayerService, private ts: TournamentService, private http: HttpClient, private router: Router) {
    }

    public playersInTourny = new Set();
    public playersToAdd = new Set();
    public playerIds = [];
    public players = [];
    public tournament: Tournament;
    public robinType = 'Single';
    public generatedPools = [];
    isDisabled = true;
    public scheduleIndices = [];
    public tournamentName: string;
    public tournyPool = [];
    public id = 0;

    ngOnInit () {
        this.ps.getPlayers().subscribe((players) => {
            this.players = players;
            for (let player of this.players) {
                this.playersToAdd.add(player);
            }
        });
    }

    // Enables or disables 'next' button based on player count
    toggleButton() {
        if (this.playersInTourny.size >= 8) {
            this.isDisabled = false;
        } else {
            this.isDisabled = true;
        }
    }
    
    // Adds player to current working roster
    addPlayer(currentPlayer: Player) {
        this.playersInTourny.add(currentPlayer);
        this.playerIds.push(currentPlayer.id);
        this.playersToAdd.delete(currentPlayer);
        this.toggleButton();
    }

    // Removes player from current working roster
    removePlayer(currentPlayer: Player) {
        this.playersInTourny.delete(currentPlayer);
        this.playersToAdd.add(currentPlayer);
        let index = this.playerIds.findIndex((id) => id == currentPlayer.id);
        this.playerIds.splice(index, 1);
        this.toggleButton();
    }

    // Creates a tournament object and calls the tournament service to add to the database
    createTourny() {
        this.tournament = new Tournament(undefined, false, this.tournamentName, true, this.playersInTourny.size, this.playerIds, [], [], []);
        this.ts.addTournament(this.tournament).subscribe(() => this.filterPlayers());
    }

    // Gets a random integer in the specified range (inclusive)
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; 
    }

    // Adds all remaining players to the working roster at once
    addAll() {
        this.playersToAdd.forEach( (player) => {
            this.playersInTourny.add(player);
            this.playerIds.push(player.id);
            this.playersToAdd.delete(player);
            this.toggleButton();
        });
    }

    // After generating balanced pools, rations remaining players among created pools
    distributeLeftovers(sameSizePools, leftovers) {
        let i = 0;
        let j = 0;
        while (i < leftovers) {
            //leftovers are greater than the number of pools available
            if (j == sameSizePools) {
                j = 0;
            }
            let rnd = this.getRandomIntInclusive(0, this.playerIds.length - 1);
            let removedPlayer = this.playerIds.splice(rnd, 1)[0];
            this.generatedPools[j].push(removedPlayer);
            
            i ++;
            j ++;
        }
    }

    addPool() {
        let pool = new Pool(this.generatedPools, this.tournamentName);
        this.ts.addPool(pool).subscribe(() => {
            this.generateSchedule();
            this.router.navigateByUrl('/tournaments/' + this.tournamentName);
        });
    }

    // Takes the selected roster and generates an appropriate player pool distribution
    generatePools() {
        let optimalGroupSize = 0;
        if(this.tournament.size <= 16) {
            optimalGroupSize = 4;
        } else if (this.tournament.size > 16 && this.tournament.size < 24) {
            optimalGroupSize = 5;
        } else {
            optimalGroupSize = 6;
        }

        let sameSizePools = Math.floor(this.playerIds.length / optimalGroupSize);
        let leftovers = this.playerIds.length % optimalGroupSize;
       
        for (let i=0; i < sameSizePools; i++) {
            let newPool = [];
            for (let j = 0; j < optimalGroupSize; j++) {
                let rnd = this.getRandomIntInclusive(0, this.playerIds.length - 1);
                let removedPlayer = this.playerIds.splice(rnd, 1)[0];
                newPool.push(removedPlayer);
            }
            this.generatedPools.push(newPool);
        }
        this.distributeLeftovers(sameSizePools, leftovers);
        this.addPool();
    }

    

    // Filters player objects based on who is in the created tournament
    filterPlayers() {
        let tourny = this.tournament;
        this.tournyPool = this.players.filter(function(value) {
            return tourny.players.includes(value['id']);
        })
        this.generatePools();
    }

    // Generates a round robin set of games and schedules them randomly 
    generateSchedule () {
        this.ts.getTournament(this.tournament.name).subscribe((tournament) => {
            this.id = tournament[0].id;
            this.generateGames();
            if (this.robinType === 'Double') {
                this.generateGames();
            }
        });
    }

    // creates all games for one round robin round for every pool
    generateGames() {
        let numberOfGames = 0;
        for (let i = 0; i < this.generatePools.length; i++) {
            numberOfGames = numberOfGames + (this.generatedPools[i].length * (this.generatedPools[i].length - 1) / 2);
        }
        for (let i = 0; i < numberOfGames; i++) {
            this.scheduleIndices.push(i);
        }
        for (let pool of this.generatedPools) {
            let j = 0;
            let i = j + 1;
            while (j < pool.length - 1) {
                while (i < pool.length) {
                    let rnd = this.getRandomIntInclusive(0, this.scheduleIndices.length - 1);
                    let removedIndex = this.scheduleIndices.splice(rnd, 1)[0];
                    let newGame = new Game(undefined, this.id, removedIndex, pool[j], pool[i], 0, 0);
                    this.ts.addGame(newGame).subscribe();
                    i++;
                }
                j++;
                i = j + 1;
            }
        }
    }
}