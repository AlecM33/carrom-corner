CREATE TABLE `Players`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `nickname` varchar(255),
  `elo` double,
  `doubles_elo` double,
  `wins` int,
  `losses` int,
  `total_diff` int,
  `singles_played` int,
  `doubles_played` int,
  `tournament_wins` int
);

CREATE TABLE `Teams`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `tourny_id` int,
  `player1_id` int,
  `player2_id` int
);

CREATE TABLE `Singles_Games`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `tourny_id` int,
  `round_id` int,
  `pool_id` int,
  `playoff` boolean,
  `playoff_id` int,
  `player1_id` int,
  `player2_id` int,
  `winner` int,
  `loser` int,
  `validator` int,
  `coin_flip_winner` int,
  `differential` int
);

CREATE TABLE `Doubles_Games`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `tourny_id` int,
  `round_id` int,
  `pool_id` int,
  `playoff` boolean,
  `playoff_id` int,
  `team1_id` int,
  `team2_id` int,
  `winner` int,
  `loser` int,
  `validator` int,
  `coin_flip_winner` int,
  `differential` int
);

CREATE TABLE `Singles_Tournaments`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `playoffs_started` boolean,
  `winner` int,
  `size` int,
  `current_round` int,
  `rounds` int,
  `active` boolean default true
);

CREATE TABLE `Doubles_Tournaments`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `playoffs_started` boolean,
  `winner1` int,
  `winner2` int,
  `size` int,
  `current_round` int,
  `rounds` int,
  `active` boolean default true
);

CREATE TABLE `Singles_Rounds`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `size` int,
  `number` int,
  `tourny_id` int
);

CREATE TABLE `Doubles_Rounds`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `size` int,
  `number` int,
  `tourny_id` int
);

CREATE TABLE `Singles_Pools`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `round_id` int,
  `number` int
);

CREATE TABLE `Doubles_Pools`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `round_id` int,
  `number` int
);

CREATE TABLE `Singles_Pool_Placements`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `pool_id` int,
  `player_id` int
);

CREATE TABLE `Doubles_Pool_Placements`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `pool_id` int,
  `team_id` int
);

CREATE TABLE `Singles_Playoffs`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `tourny_id` int,
  `winner` int,
  `ended` boolean
);

CREATE TABLE `Doubles_Playoffs`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `tourny_id` int,
  `winner1` int,
  `winner2` int,
  `ended` boolean
);

CREATE TABLE `Singles_Brackets`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `playoff_id` int,
  `size` int,
  `depth` int
);

CREATE TABLE `Doubles_Brackets`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `playoff_id` int,
  `size` int,
  `depth` int
);

CREATE TABLE `Singles_Bracket_Nodes`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `bracket_id` int,
  `player1_id` int,
  `player2_id` int,
  `seed1` int,
  `seed2` int,
  `node_index` int
);

CREATE TABLE `Doubles_Bracket_Nodes`
(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `bracket_id` int,
  `team1_id` int,
  `team2_id` int,
  `seed1` int,
  `seed2` int,
  `node_index` int
);

ALTER TABLE `Teams` ADD FOREIGN KEY (`tourny_id`) REFERENCES `Doubles_Tournaments` (`id`);

ALTER TABLE `Teams` ADD FOREIGN KEY (`player1_id`) REFERENCES `Players` (`id`);

ALTER TABLE `Teams` ADD FOREIGN KEY (`player2_id`) REFERENCES `Players` (`id`);

ALTER TABLE `Singles_Games` ADD FOREIGN KEY (`tourny_id`) REFERENCES `Singles_Tournaments` (`id`);

ALTER TABLE `Singles_Games` ADD FOREIGN KEY (`player1_id`) REFERENCES `Players` (`id`);

ALTER TABLE `Singles_Games` ADD FOREIGN KEY (`player2_id`) REFERENCES `Players` (`id`);

ALTER TABLE `Singles_Games` ADD FOREIGN KEY (`winner`) REFERENCES `Players` (`id`);

ALTER TABLE `Doubles_Games` ADD FOREIGN KEY (`tourny_id`) REFERENCES `Doubles_Tournaments` (`id`);

ALTER TABLE `Doubles_Games` ADD FOREIGN KEY (`team1_id`) REFERENCES `Teams` (`id`);

ALTER TABLE `Doubles_Games` ADD FOREIGN KEY (`team2_id`) REFERENCES `Teams` (`id`);

ALTER TABLE `Doubles_Games` ADD FOREIGN KEY (`winner`) REFERENCES `Teams` (`id`);

ALTER TABLE `Singles_Tournaments` ADD FOREIGN KEY (`winner`) REFERENCES `Players` (`id`);

ALTER TABLE `Doubles_Tournaments` ADD FOREIGN KEY (`winner1`) REFERENCES `Players` (`id`);

ALTER TABLE `Doubles_Tournaments` ADD FOREIGN KEY (`winner2`) REFERENCES `Players` (`id`);

ALTER TABLE `Singles_Rounds` ADD FOREIGN KEY (`tourny_id`) REFERENCES `Singles_Tournaments` (`id`);

ALTER TABLE `Doubles_Rounds` ADD FOREIGN KEY (`tourny_id`) REFERENCES `Doubles_Tournaments` (`id`);

ALTER TABLE `Singles_Pools` ADD FOREIGN KEY (`round_id`) REFERENCES `Singles_Rounds` (`id`);

ALTER TABLE `Doubles_Pools` ADD FOREIGN KEY (`round_id`) REFERENCES `Doubles_Rounds` (`id`);

ALTER TABLE `Singles_Pool_Placements` ADD FOREIGN KEY (`pool_id`) REFERENCES `Singles_Pools` (`id`);

ALTER TABLE `Singles_Pool_Placements` ADD FOREIGN KEY (`player_id`) REFERENCES `Players` (`id`);

ALTER TABLE `Doubles_Pool_Placements` ADD FOREIGN KEY (`pool_id`) REFERENCES `Doubles_Pools` (`id`);

ALTER TABLE `Doubles_Pool_Placements` ADD FOREIGN KEY (`team_id`) REFERENCES `Teams` (`id`);

ALTER TABLE `Singles_Playoffs` ADD FOREIGN KEY (`tourny_id`) REFERENCES `Singles_Tournaments` (`id`);

ALTER TABLE `Singles_Playoffs` ADD FOREIGN KEY (`winner`) REFERENCES `Players` (`id`);

ALTER TABLE `Doubles_Playoffs` ADD FOREIGN KEY (`tourny_id`) REFERENCES `Doubles_Tournaments` (`id`);

ALTER TABLE `Doubles_Playoffs` ADD FOREIGN KEY (`winner1`) REFERENCES `Players` (`id`);

ALTER TABLE `Doubles_Playoffs` ADD FOREIGN KEY (`winner2`) REFERENCES `Players` (`id`);

ALTER TABLE `Singles_Brackets` ADD FOREIGN KEY (`playoff_id`) REFERENCES `Singles_Playoffs` (`id`);

ALTER TABLE `Doubles_Brackets` ADD FOREIGN KEY (`playoff_id`) REFERENCES `Doubles_Playoffs` (`id`);

ALTER TABLE `Singles_Bracket_Nodes` ADD FOREIGN KEY (`bracket_id`) REFERENCES `Singles_Brackets` (`id`);

ALTER TABLE `Singles_Bracket_Nodes` ADD FOREIGN KEY (`player1_id`) REFERENCES `Players` (`id`);

ALTER TABLE `Singles_Bracket_Nodes` ADD FOREIGN KEY (`player2_id`) REFERENCES `Players` (`id`);

ALTER TABLE `Doubles_Bracket_Nodes` ADD FOREIGN KEY (`bracket_id`) REFERENCES `Doubles_Brackets` (`id`);

ALTER TABLE `Doubles_Bracket_Nodes` ADD FOREIGN KEY (`team1_id`) REFERENCES `Teams` (`id`);

ALTER TABLE `Doubles_Bracket_Nodes` ADD FOREIGN KEY (`team2_id`) REFERENCES `Teams` (`id`);
