import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { PlayerListComponent } from './Players/player-list.component';
import { AddPlayerComponent } from './Players/add-player.component';
import { environment } from '../environments/environment';
import { AddSinglesComponent } from './Tournaments/add-singles.component'
import { AddDoublesComponent } from './Tournaments/add-doubles.component';
import { CoreModule } from './core.module';
import { TournamentListComponent } from './Tournaments/tournament-list.component';
import { ViewTournamentComponent } from './Tournaments/view-tournament.component';
import { AddGameComponent } from './Tournaments/add-game.component';
import { PlayoffsComponent } from './Tournaments/playoffs.component';

@NgModule({
  declarations: [
    AppComponent, PlayerListComponent, AddPlayerComponent, AddSinglesComponent, AddDoublesComponent, TournamentListComponent, ViewTournamentComponent, AddGameComponent, PlayoffsComponent
  ],
  imports: [
    BrowserModule, 
    FormsModule,
    HttpModule,
    HttpClientModule,
    JsonpModule,
    RouterModule.forRoot([
      { path: 'players/add', component: AddPlayerComponent },
      { path: 'players', component: PlayerListComponent},
      { path: 'tournament/singles/new', component: AddSinglesComponent},
      { path: 'tournament/doubles/new', component: AddDoublesComponent},
      { path: 'tournaments', component: TournamentListComponent},
      { path: 'tournaments/:name', component: ViewTournamentComponent},
      { path: ':name/games/:id/enter_result', component: AddGameComponent},
      { path: 'playoffs/:id', component: PlayoffsComponent}
    ]),
    CoreModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
