--- load with 
--- psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f schema.sql
DROP TABLE stats CASCADE;
DROP TABLE ftduser CASCADE;
CREATE TABLE ftduser (
	username VARCHAR(20) PRIMARY KEY,
	password BYTEA NOT NULL,
	difficulty varchar(10) NOT NULL,
	country varchar(10) NOT NULL,
	email TEXT NOT NULL
);

CREATE TABLE stats (
	username VARCHAR(20) PRIMARY KEY,
	playtimes int NOT NULL,
	hightestScore int NOT NULL,
	totalScore int NOT NULL,
	FOREIGN KEY(username) REFERENCES ftduser(username)
);
--- Could have also stored as 128 character hex encoded values
--- select char_length(encode(sha512('abc'), 'hex')); --- returns 128
INSERT INTO ftduser VALUES('user1', sha512('password1'),'','','');
INSERT INTO stats VALUES('user1', 0,0,0);
