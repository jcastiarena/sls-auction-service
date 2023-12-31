import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import createError from 'http-errors';
import cors from '@middy/http-cors';
import { getAuctionById } from './getAuction';
import { uploadPictureToS3 } from '../lib/uploadPictureToS3';
import { setAuctionPictureUrl } from '../lib/setAuctionPictureUrl';
import { transpileSchema } from '@middy/validator/transpile';
import uploadAuctionPictureSchema from '../lib/schemas/uploadAuctionPictureSchema';

export async function uploadAuctionPicture(event, context) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionById(id);

  if (auction.seller !== email) {
    throw createError.Forbidden('Only the auction owner can upload pictures');
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, 'base64');

  let updatedAuction;

  try {
    const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', buffer);
    updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);

    console.log(pictureUrl);
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
}

export const handler = middy(uploadAuctionPicture).use(httpErrorHandler()).use(validator({
  eventSchema: transpileSchema(uploadAuctionPictureSchema),
  ajvOptions: {
    strict: true
  }
})).use(cors());