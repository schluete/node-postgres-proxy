
run:
	node runner.js

test:
	curl -v -X POST --data "select * from comics limit 5" http://localhost:7070/comics


table:
	curl -v -X POST --data "drop table foobar" http://localhost:7070/schluete
	curl -v -X POST --data "create table foobar(id integer primary key not null, name varchar(50)" http://localhost:7070/schluete
