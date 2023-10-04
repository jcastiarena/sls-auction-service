# Serverless Notification Service

This service is part of a system to place bids on auctions for selling online books. It uses the serverless framework and various AWS services including DynamoDB, SQS, SES and S3. It uses Auth0 as authenticating service.

## Install

```
git clone
cd YOUR_PROJECT_NAME
npm i
sls deploy --verbose
```

## Usage

In order to access the endpoints, you need to authenticate first. For instructions please refer to 

### Create an auction

```
curl --location 'https://YOUR_DOMAIN.execute-api.eu-west-1.amazonaws.com/dev/auction' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
--data '{"title": "Encrucijada"}'
```

### Get auctions

```
curl --location 'https://YOUR_DOMAIN.execute-api.eu-west-1.amazonaws.com/dev/auctions?=null' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
--data ''
```

### Get an auction

```
curl --location 'https://YOUR_DOMAIN.execute-api.eu-west-1.amazonaws.com/dev/auctions/AUCTION_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
--data '{"title": "Encrucijada"}'
```

### Place bid

```
curl --location --request PATCH 'https://YOUR_DOMAIN.execute-api.eu-west-1.amazonaws.com/dev/auction/AUCTION_ID/bid' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
--data '{"amount": 10}'
```


Work based on @arielweinberger's course
