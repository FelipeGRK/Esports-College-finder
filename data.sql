CREATE DATABASE esports_colleges;

USE esports_colleges;

CREATE TABLE Schools(
Id INT AUTO_INCREMENT PRIMARY key,
name VARCHAR(255),
Location
has_scholarship BOOLEAN,
website VARCHAR(255)
);
ALTER TABLE schools ADD COLUMN school_type ENUM('2-year', '4-year') NOT NULL DEFAULT '4-year';

CREATE TABLE Esports_Games(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL
);


CREATE TABLE Majors(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL
);

CREATE TABLE Schools_games(
id INT AUTO_INCREMENT PRIMARY KEY,
school_id INT,
game_id INT,
    FOREIGN KEY (school_id) REFERENCES Schools(id),
    FOREIGN KEY (game_id) REFERENCES Esports_Games(id),
);
CREATE TABLE School_Majors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT,
    major_id INT,
    FOREIGN KEY (school_id) REFERENCES Schools(id),
    FOREIGN KEY (major_id) REFERENCES Majors(id)
);

INSERT INTO Schools(name,location,school_type,has_scholarship,website)
VALUES(
