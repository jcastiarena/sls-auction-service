import createError from 'http-errors';
import { closeAuction } from '../lib/closeAuction';
import { getEndedAuctions } from '../lib/getEndedAuctions';

async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closedPromises = auctionsToClose.map(auction => closeAuction(auction));
    await Promise.all(closedPromises);    
    return { closed: closedPromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processAuctions;