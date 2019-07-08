import { Injectable } from '@angular/core';
import { Player } from '../Players/player';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { EloService } from './elo.service';
import { environment } from 'environments/environment';
import {Team} from '../Teams/team';

/* This service provides useful methods in regards to manipulating player data and
making calls to the database */
@Injectable()
export class TeamService {


  constructor(private http: HttpClient) {
  }

  // Takes an observable and creates player objects from the data observed
  populateWithTeams(retrievedTeams: any[]): Team[] {
    const teams = [];

    for (const jsonTeam of retrievedTeams) {
      const newTeam = new Team(jsonTeam['tourny_id'], jsonTeam['player1_id'], jsonTeam['player2_id']);
      newTeam.id = jsonTeam['id'];
      teams.push(newTeam);
    }
    return teams;
  }

  // Sends a GET request to the database for all players
  getTeams(tournamentId: number): Observable<Team[]> {
    return this.http.request('get', '/api/teams/get/' + tournamentId, {
      headers: {
        'Content-Type': 'application/json'}
    }).map(this.populateWithTeams);
  }
}
