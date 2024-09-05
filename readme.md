# Introduction

The protocol server handles the transaction with gateway and NP. It also used for header creation/validation, schema validation and attribute validation.

# Repository Structure

- src/
- public/
- .env
- .env-sample-buyer
- .env-sample-seller
- .env-sample-both
- Readme

# Change Log

    This is the version 0.0.1 of the protocol server

# Contribution

Contributions can be made using the following branching structure:

```
    Branches: master -> Integ -> feat/fix/feature
```

# Dependency

- ngrok (for local devlopment)

# Pre-requisite

- git
- npm
- Node.js

# How to run - local

- Clone the repo [https://github.com/ONDC-Official/buyer-mock-engine]

```
git clone https://github.com/ONDC-Official/buyer-mock-engine
```

- Checkout to master branch

```
git checkout master
```

- Install dependencies

```
npm i
```

- Create a .env file with the provided .env-sample file
- Run the application

```
npm start
```
