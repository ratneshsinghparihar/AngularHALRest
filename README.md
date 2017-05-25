# AngularHALRest

AngularHALRest is front end ORM for Angular apps to work with HAL APIs.
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
