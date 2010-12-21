
run:
	node runner.js

dependencies: 
	git submodule update --init lib/node-postgres
	git submodule update --init lib/node-elf-logger

test:
	curl -X POST --data "drop table foobar" http://localhost:7070/schluete
	curl -X POST --data "create table foobar(id serial not null primary key, name varchar(50))" http://localhost:7070/schluete
	curl -X POST --data "insert into foobar(name) values('Gustav Gans')" http://localhost:7070/schluete
	curl -X POST --data "select * from foobar" http://localhost:7070/schluete
