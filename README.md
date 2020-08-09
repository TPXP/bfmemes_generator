# BFMemes Generator
A web-based meme generator, because generating memes on the go is much more convenient.

Official URL: https://generator.bfmemes.com

## Getting started
This project relies on Webpack to easily integrate any NPM module, as well as process images
as required.

Make sure you have Node.JS installed (recommended version: 14) and install the dependencies with
yarn:
```
yarn install
```

Then, start the Webpack Development server
```
yarn dev
```

The generator should be up and running at http://localhost:8080 (check the output of the command). Changes you
make to any file should appear instantly in your web browser thanks yo the magic of hot reloading.

## Production build
To generate a production build, use the following command:
```
yarn build
```

The files will be in the `dist` directory.

By default, webpack will load resources from https://generator.bfmemes.com. If you deploy this build
to another host, set the url:
```
yarn build --url=https://my.super.custom.generator.example.org/subdirectory
```

## Licence
MIT