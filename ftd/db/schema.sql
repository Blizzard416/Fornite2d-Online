--- load with 
--- psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f schema.sql
DROP TABLE stats CASCADE;
DROP TABLE ftduser CASCADE;
CREATE TABLE ftduser (
	username VARCHAR(20) PRIMARY KEY,
	password BYTEA NOT NULL,
	gender varchar(10) NOT NULL,
	country varchar(10) NOT NULL,
	email TEXT NOT NULL
);

CREATE TABLE stats (
	username VARCHAR(20) PRIMARY KEY,
	easyHighest int NOT NULL,
	interHighest int NOT NULL,
	hardHighest int NOT NULL,
	FOREIGN KEY(username) REFERENCES ftduser(username) ON DELETE CASCADE,
	CHECK (easyHighest >= 0),
	CHECK (interHighest >= 0),
	CHECK (hardHighest >= 0)
);
--- Could have also stored as 128 character hex encoded values
--- select char_length(encode(sha512('abc'), 'hex')); --- returns 128