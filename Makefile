
TEST_DATABASE = http://localhost:7070/sql/node
TEST_JSON = http://localhost:7070/json/node
CREDENTIALS = "top:secret"

run:
	node runner.js

dependencies: 
	git submodule update --init lib/node-postgres
	git submodule update --init lib/node-elf-logger
	git submodule update --init lib/underscore

test:
	curl -u $(CREDENTIALS) -X POST --data "drop table persons" $(TEST_DATABASE)
	curl -u $(CREDENTIALS) -X POST --data "create table persons(id serial not null primary key, name varchar(50))" $(TEST_DATABASE)
	curl -u $(CREDENTIALS) -X POST --data "insert into persons(name) values('Pierre Niemans')" $(TEST_DATABASE)
	curl -u $(CREDENTIALS) -X POST --data "insert into persons(name) values('Max Kerkerian')" $(TEST_DATABASE)
	curl -u $(CREDENTIALS) -X POST --data "insert into persons(name) values('Fanny Ferreira')" $(TEST_DATABASE)
	curl -u $(CREDENTIALS) -X POST --data "select * from persons" $(TEST_DATABASE)

test_json:
	curl -u $(CREDENTIALS) -X POST --data '{"table": "persons", "data": [{"conditions": {"id":2 }, "values": {"name": "Judith Hérault (update)"}}]}' $(TEST_JSON)
	curl -u $(CREDENTIALS) -X POST --data '{"table": "persons", "data": [{"conditions": {"id":4}, "values": {"name": "Judith Hérault (insert)"}}]}' $(TEST_JSON)
	curl -u $(CREDENTIALS) -X POST --data "select * from persons" $(TEST_DATABASE)
