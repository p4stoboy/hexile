This repo being public is fundamentally a guide for anyone trying to implement simple socket patterns for similar use cases.
If you are interested in the p5 sketch for the board hit me up and I'll tidy the client code up.

Running instance:

[hexile.xyz](https://hexile.xyz)


Deploying your own instance:
1. _Install dependencies_
> npm i

2. _Edit index.ts with your TLS paths_

3. _Compile server_
> tsc

Paste server build output (`./build`) in to directory above `./public` and run index.js.