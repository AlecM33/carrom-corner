import { Component, OnInit } from '@angular/core';
import { Player } from './player';
import { PlayerService } from './player.service';
import { AppComponent } from '../app.component';
import { NgModel } from '@angular/forms';
import { FormsModule } from '@angular/forms'
import { PlayerListComponent } from './player-list.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'add-player.component.html'
})
export class AddPlayerComponent {

    constructor(private _playerService: PlayerService, private router: Router) {
    }

    newPlayerName: string;
    newPlayerNickname: string;

    //Function for adding a new player to the database when user submits
    onSubmit() {
        let newPlayer = {name: this.newPlayerName, nickname: this.newPlayerNickname};
        this._playerService.addPlayer(newPlayer).subscribe(() => {
            this.router.navigateByUrl('/players');
        });
    }
}
