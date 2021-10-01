
import { makeCampaña, getCampañas, vote, makeExtendedCampaña } from '../../assembly';
import { storage, Context, runtime_api, VMContext, logging } from "near-sdk-as";

const someContract = "somecontract.testnet"
const wcom = 'wcom.testnet';
const allcharmian = "allcharmian.testnet"
const bravio = "bravio.testnet"
const lazio = "lazio.testnet"
const smartio = "smartio.testnet"

describe("Campaña", () => {

    beforeEach(() => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)
    });

    itThrows("disallow make Campaña on behalf", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(someContract)
        makeCampaña("test Campaña")
    });

    it("should create Campaña", () => {
        var campaña = makeCampaña("test Campaña");
        expect(campaña.id).toStrictEqual(0)
        expect(getCampañas('me').length).toStrictEqual(1);    
        expect(getCampañas('').length).toStrictEqual(0);
        expect(getCampañas('me')[0].campaña.who).toStrictEqual(allcharmian);
        log("Campaña created by: " + getCampañas('me')[0].campaña.who);    
    });

    it("should create two Campañas by the same creator", () => {
        var campaña1 = makeCampaña("test Campaña");
        expect(campaña1.id).toStrictEqual(0)
        var campaña2 = makeCampaña("test Campaña 2");
        expect(campaña2.id).toStrictEqual(1)
        expect(getCampañas('me').length).toStrictEqual(2);    
        expect(getCampañas('').length).toStrictEqual(0);
        log("total Campañas created: " + "by " + allcharmian + ": " + getCampañas('me').length.toString());
        log("total Campañas created: " + "by others " + ": " + getCampañas('').length.toString());
    });

    it("should create two Campañas by different creators", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeCampaña("allcharmian's Campaña");
        expect(campaña1.campaña.who).toStrictEqual(allcharmian);
        expect(getCampañas('me').length).toStrictEqual(1);    
        expect(getCampañas('').length).toStrictEqual(0);    

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        var campaña2 = makeCampaña("bravio's Campaña");
        expect(campaña2.campaña.who).toStrictEqual(bravio);
        expect(getCampañas('me').length).toStrictEqual(1);    
        expect(getCampañas('').length).toStrictEqual(1);    

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        expect(getCampañas('me').length).toStrictEqual(0);    
        expect(getCampañas('').length).toStrictEqual(2);    
    });

    itThrows("should disallow to vote for own public Campaña", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeCampaña("allcharmian's Campaña");
        vote(campaña1.id, true);
    });

    it("should allow to vote for other's public Campaña", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeCampaña("allcharmian's Campaña");

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        campaña1 = vote(campaña1.id, true);
        expect(campaña1.campaña.vote_yes).toStrictEqual(1);
        expect(campaña1.campaña.vote_no).toStrictEqual(0);

        campaña1 = vote(campaña1.id, true);
        expect(campaña1.campaña.vote_yes).toStrictEqual(1);
        expect(campaña1.campaña.vote_no).toStrictEqual(0);

        campaña1 = vote(campaña1.id, false);
        expect(campaña1.campaña.vote_yes).toStrictEqual(0);
        expect(campaña1.campaña.vote_no).toStrictEqual(1);

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        campaña1 = vote(campaña1.id, false);
        expect(campaña1.campaña.vote_yes).toStrictEqual(0);
        expect(campaña1.campaña.vote_no).toStrictEqual(2);

        campaña1 = vote(campaña1.id, false);
        expect(campaña1.campaña.vote_yes).toStrictEqual(0);
        expect(campaña1.campaña.vote_no).toStrictEqual(2);
    });

    itThrows("should disallow Campaña creation with invalid viewers", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeExtendedCampaña("allcharmian's Campaña", ["blablabla"], []);
        vote(campaña1.id, true);
    });

    itThrows("should disallow Campaña creation with invalid voters", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeExtendedCampaña("allcharmian's Campaña", [], ["blablabla"]);
        vote(campaña1.id, true);
    });

    itThrows("should create private Campaña with no voters", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio], []);
        vote(campaña1.id, true);
    });

    itThrows("should disallow to vote for own private Campaña if not in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio], []);
        vote(campaña1.id, true);
    });

    it("should allow to vote for own private Campaña if in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio, allcharmian], [allcharmian]);
        vote(campaña1.id, true);
    });

    itThrows("should disallow to vote for other's private Campaña if not in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio, allcharmian], [bravio]);

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        vote(campaña1.id, true);
    });

    it("should allow to vote for other's private Campaña if in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio, allcharmian], [bravio]);

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        vote(campaña1.id, true);
    });

    it("should return only private Campañas where in viewers list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio], [bravio, allcharmian, smartio]);
        expect(campaña1.campaña.canView.has(bravio)).toStrictEqual(true);
        expect(campaña1.campaña.canView.has(allcharmian)).toStrictEqual(true);
        expect(campaña1.campaña.canVote.has(bravio)).toStrictEqual(true);
        expect(campaña1.campaña.canVote.has(allcharmian)).toStrictEqual(true);

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        var lazioscampañas = getCampañas("others");
        expect(lazioscampañas.length).toStrictEqual(0)

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        var bravioscampañas = getCampañas("others");
        expect(bravioscampañas.length).toStrictEqual(1)

        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var allcharmianscampañas = getCampañas("others");
        expect(allcharmianscampañas.length).toStrictEqual(1)

        VMContext.setSigner_account_id(smartio)
        VMContext.setPredecessor_account_id(smartio)

        var smartioscampañas = getCampañas("others");
        expect(smartioscampañas.length).toStrictEqual(1)
    });

});
