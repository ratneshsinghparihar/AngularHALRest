# AngularHALRest
WHY Angular?
No need to explain this.


Why HAL APis?
HAL APis are next generation of rest maturity model (type 4) , It allows the auto documentation , self discovery , dynamic apis (fetch only what you need, not everythingh) , adoption of type4 from type 2 to type 3 is very high and alomost every modern APIs are in HAL .

Why ORM in front end Apps?
ORM provied a design first approach , which make sure the developer create models , define relations among them , encapsulate the CRUDs in Unit of work / repositories and then use them in data services , this way the data services will be cleaner and will not have necessary boilerplate code , It give the front end app a strcuture for unit testing.

WHY AngularHALRest?

AngularHALRest is front end ORM for Angular apps to work with HAL APIs.
If you are using Angular and HAL both and looking for an ORM then AngularHALRest is the right library.
It Provide a simple mechanism to handle unit of work using HAL APIs.
Since HAL APIs provide autoDiscovery and links to all related resources (children), AngularHALRest helps the consumers to build entity models with relations and allows CRUDS with full heirarchy(means CRUD in parent will cascade the CRUD to children) . This comes in handy when writing high data driven front end application .

AngularHAL rest library provides infrastructure to communicate through HAL rest API .

Here are the features of AngularHALRest

1)Unit of work

 creatation of entity , updation of enity , deletion and findone and find all.

2)url to associations and vice versa

 creatation of associated entites , updation of associated enities , deletion of associated enities and findone and find all of associated enities.

fetch parent of an entity, cascaded CRUDs on parents , uncles. 

3)url to aggregations and vice versa

from a HAL url if output is array , provides simple way to aggregate the array based on field, nested level aggregation are possoible

4)Nested Object graph fetching
from a HAL url if there are hal url in _links , it will go and fetch them automatically and if output model strcuture is provided then it will set in model's right property (this saves massive amount of code and chances to js error when doing manual js field mapping)

5)support for embedded objects
HAL apis provide _embedded objects so that frontend don't need to make muliple calls , when fetching relational model AngularHALRest make sure to check into _embedded objects and don't make api calls if found in _embedded objects

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/1457/badge)](https://bestpractices.coreinfrastructure.org/projects/1457)
