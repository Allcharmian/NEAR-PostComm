import { Context, env, logging, PersistentMap, PersistentVector, storage } from 'near-sdk-as'
import { Campaña, Returnedcampaña, Vote, campañas } from './classes';

 export function getCampañas(target: string): Returnedcampaña[] {
  assert(Context.predecessor == Context.sender)

  const result = new Array<Returnedcampaña>()
  const forMe = (target == 'me')
  // logging.log('getcampañas: sender = ' + Context.sender + ', target = ' + target + ', forMe = ' + forMe.toString())

  for(let i = 0; i < campañas.length; ++i) {
    // logging.log('getcampañas: campaña = ' + campañas[i].who + ', campañas[i].who === Context.sender = ' + (campañas[i].who == Context.sender).toString())

    let campaña = campañas[i]
    if(forMe == true) {
      if(campaña.who == Context.sender)
        result.push(new Returnedcampaña(i, campaña))
    } else {
      var isPublicNotMinecampaña = campaña.canView.size == 0 && campaña.who != Context.sender
      var canViewcampaña = (isPublicNotMinecampaña ? true : campaña.canView.has(Context.sender))

      if(canViewcampaña)
        result.push(new Returnedcampaña(i, campaña))
    }
  }
  return result;
 }

export function vote(campañaId: i32, value: boolean) : Returnedcampaña {
  assert(Context.predecessor == Context.sender)
  assert(campañaId >= 0 && campañaId < campañas.length)

  logging.log('vote: sender = ' + Context.sender + ', campañaId = ' + campañaId.toString() + ', value = ' + value.toString() + ', total campañas = ' + campañas.length.toString())
  let campaña = campañas[campañaId];

  let isPubliccampaña = campaña.canVote.size == 0
  let isAllowedToVote = isPubliccampaña ? (campaña.who != Context.sender) : campaña.canVote.has(Context.sender)
  assert(isAllowedToVote)

  let newVote = value == true ? Vote.Yes : Vote.No
  if(campaña.votes.has(Context.predecessor)) {
    logging.log('vote: re-vote...')

    let voteValue = campaña.votes.get(Context.predecessor);
    logging.log('voteValue = ' + voteValue.toString())

    if(newVote != voteValue) {
      logging.log('value != voteValue')

      campaña.votes.set(Context.predecessor, newVote);
      if(voteValue == Vote.Yes) {
        logging.log('re-vote to no')

        campaña.vote_yes -= 1
        campaña.vote_no += 1 
      } else {
        logging.log('re-vote to yes')

        campaña.vote_yes += 1
        campaña.vote_no -= 1
      }
    } 
    else 
    {
      logging.log('value = voteValue = ' + value.toString())
    }
  } else {
    logging.log('vote: new vote...')

    campaña.votes.set(Context.predecessor, newVote);
    if(value == true) {
      logging.log('vote to yes')
      campaña.vote_yes += 1
    } else {
      logging.log('vote to no')
      campaña.vote_no += 1
    }
  }

  logging.log('vote: replacing campañaId ' + campañaId.toString() + ' with campaña = '
   + campaña.vote_yes.toString() + "/" + campaña.vote_no.toString())

  campañas.replace(campañaId, campaña);
  return new Returnedcampaña(campañaId, campañas[campañaId])
}

export function makeExtendedCampaña(what: string, viewers: string[], voters: string[]) : Returnedcampaña {
  assert(Context.predecessor == Context.sender)

  var campaña = new Campaña(what)
  for(let i = 0; i < viewers.length; ++i) {
    let viewer = viewers[i];
    assert(env.isValidAccountID(viewer), "viewer account is invalid")

    logging.log('adding viewer: ' + viewer)
    campaña.canView.add(viewer)
  }

  for(let i = 0; i < voters.length; ++i) {
    let voter = voters[i];
    assert(env.isValidAccountID(voter), "voter account is invalid")

    logging.log('adding voter: ' + voter)
    campaña.canVote.add(voter)

    // all voters are viewers too, otherwise how can they vote?
    logging.log('adding voter to viewers: ' + voter)
    campaña.canView.add(voter)
  }

  campañas.push(campaña);
  return new Returnedcampaña(campañas.length - 1, campañas[campañas.length - 1])
}

export function makeCampaña(what: string) : Returnedcampaña {
  assert(Context.predecessor == Context.sender)

  campañas.push(new Campaña(what));
  return new Returnedcampaña(campañas.length - 1, campañas[campañas.length - 1])
}

// debug only 
export function clearAll(): void {
  assert(Context.predecessor == Context.sender)

  while(campañas.length !== 0)
    campañas.pop();
}
