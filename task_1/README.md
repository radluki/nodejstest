# Theory

In this part you need to concisely answer each question.

## General

- What libraries do you consider necessary for any application? Which ones do you use most commonly?
ExpressJs, NestJs - web app frameworks
Db access libs - typeorm (postgres), mongoose (mongodb), ioredis (redis) and others depending on the needs
Testing - jest (preferable), supertest, mocha (an alternative to jest), ts-mockito (useful alternative to jest mocks)

- How would you choose a backend? When would you use HTTP server, serverless functions or Websockets?
Http server/EC2/ECS:
    - to reduce latancy, because start up is performed only once,
    - if the resource needs to be allocated for over 15 min which is an execution limit for a lambda. For example the server should keep the connection open for real time data transmissions, or it processes continuously the data.
Serverless is usually preferred because of benefits of event driven architecture, scalability and cost reductions.
Websockets for bidirectional, continuous, low latency data streams.

- When starting a new project how would you choose between OOP and Functional Programming?
OOP for large, scalable, complex and statefull applications.
Functional programming for stateless and less sophisticated apps, web apis for example.
In case of API servers it is beneficial to combine the two and to use OOP with stateless classes.
The objects in such cases store only dependencies as fields. 
It allows for taking advantage of polymorphism, dependency injection and increased testability.
Nest js is based on that.

- What is middleware useful for?
It is usefull for generic steps in request handling that should be shared by different endpoints.
Common usecases:
- error handling - in case of an exception, error handler middleware can send appropriate response and log the details
- logging of incoming messages
- request parsing - for example json middleware for parsing body in express js
- query validation - validating query parameters or body of a request, sending an error response or passing execution further 

## TypeScript and NodeJS

- Explain what are prototypes and how does class inheritance make use of them?
TypeScript is only additional layer over JavaScript. 
In JavaScript everything is a dynamic object, the fields of objects can be dynamically added
or removed, they can be either data types or functions.
Example:
const prot1 =  { field: 3, hello: function() { console.log('Hello'); } }

Objects can be created based on other objects which are prototypes:
const child = Object.create(prot1);

As a result the child is linked to its prototype.
When accessing child fields, if they are not found in child, then the prototype is searched.

Classes in TypeScript compile to protorypes and inheriting links prototypes in chains.

- What is type narrowing and how does it work?

In TypeScript we can use generic types like any/unknown, or union types i.e. string | number.
Sometimes the implementation is type specific, so the more generic type has to be narrowed.
It is done usually by checking the type in if statement. Example:

class Cat {
  meow() { console.log("meow"); }
}

class Dog {
  bark() { console.log("bark"); }
}

function makeSound(pet: Cat | Dog): void {
  // pet.bark(); // error without narrowing
  if (pet instanceof Cat) {
    pet.meow();
    return;
  }
  pet.bark();
}

Thanks to narrowing this code compiles. The compiler narrows the type based on a checked condition

- How does NodeJS provide asynchronism and concurrency?
NodeJs is single threaded, but it supports concurency and asynchronism based on promises.
There are 2 ways of implementing concurrency:
    - creating promise objects, and using callbacks - the old way
    - using async/await syntax - the prefered, modern way
The code is executed synchronuously until there is a need for asynchronous operation (http request, database query),
in such case instead of blocking execution usually a promise is returned. The promise can be awaited and in this way
the current execution can be blocked till the result is obtained.
In the meantime however other promises handling can be resumed.
So the request executions interwine at exact, deterministic places in the code.

- What is a Promise?
A promise is a type that represents a value that will be provided asynchronouosly.
For example a value that is extracted from rest api or db. To use the value we can either await or set a callback.
The promises can resolve in case of success, or reject in case of error.

- What build tools would you use when deploying code to the cloud?
For lambdas: npm, tsc, zip, aws cli with bash or aws sdk with js 
For ECS additionally docker. I would use these tools on a CI/CD pipline, i.e. Gitlab CI/CD, Github Actions, AWS CodeBuild

## AWS

- Name AWS services that can be used for asynchronous communication. What are the differences between them?
SQS - a message queue service, the messages from a single queue are usually read by a single service, 
      although the service may be scaled horizontally, it is used to decouple the services
SNS - pub/sub service for broadcasting messages/events to multiple recipients

- What tools do you use to monitor the application?
AWS CloudWatch

- What are Secondary Indexes in DynamoDB useful for?
Indexes in any db are used to optimize queries.
They add a new data structure to the database that reduces complexity of queries based on a field that is not a primary key.
