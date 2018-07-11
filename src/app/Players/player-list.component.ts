import { Component, OnInit } from '@angular/core';
import { Player } from './player';
import { HttpModule, JsonpModule } from '@angular/http';
import { PlayerService } from './player.service';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Config } from 'protractor';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Component({
  selector: 'cr-players',
  templateUrl: './player-list.component.html',
})

export class PlayerListComponent implements OnInit {

  public players = [];

  constructor(private _playerService: PlayerService, private http: HttpClient) { 
  }

  // calls the delete function from the player service, refreshes the player list
  delete(player) {
    if(confirm('Delete this player?')) {
      this.players = [];
      this._playerService.deletePlayer(player).do(() => {
        this._playerService.getPlayers().subscribe((players) => {
          this.players = players;
        })
        }).subscribe();
      }
  }
  
  // gets player list for list view
  ngOnInit() {
    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
    });
  }
}
