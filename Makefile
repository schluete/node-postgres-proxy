
TEST_DATABASE = http://localhost:7070/node

run:
	node runner.js

dependencies: 
	git submodule update --init lib/node-postgres
	git submodule update --init lib/node-elf-logger

test:
	curl -u "top:secret" -X POST --data "drop table persons" $(TEST_DATABASE)
	curl -u "top:secret" -X POST --data "create table persons(id serial not null primary key, name varchar(50))" $(TEST_DATABASE)
	curl -u "top:secret" -X POST --data "insert into persons(name) values('Pierre Niemans')" $(TEST_DATABASE)
	curl -u "top:secret" -X POST --data "insert into persons(name) values('Max Kerkerian')" $(TEST_DATABASE)
	curl -u "top:secret" -X POST --data "insert into persons(name) values('Fanny Ferreira')" $(TEST_DATABASE)
	curl -u "top:secret" -X POST --data "select * from persons" $(TEST_DATABASE)
