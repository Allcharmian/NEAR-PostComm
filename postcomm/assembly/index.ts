export enum Vote {
    Yes,
    No
}
export class campaña {
    who: string;
    vote_yes: u64 = 0;
    vote_no: u64 = 0;
    timestamp: u64 = 0;
    votes: Map<string, Vote> = new Map<string, Vote>();
    canView: Set<string> = new Set<string>();
    canVote: Set<string> = new Set<string>();
  
    constructor(public what: string) {
      this.who = Context.sender;
      this.timestamp = Context.blockTimestamp;
    }
  }

export class Returnedcampaña {
    constructor(public id: i32, public campaña: campaña) {
    }    
}
export const campaña = new PersistentVector<Campaña>("p");
