import { makeCampaña, getCampañas, vote, makeExtendedCampaña } from '../../assembly';
import { storage, Context, runtime_api, VMContext, logging } from "near-sdk-as";

const someContract = "somecontract.testnet"

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
        var Campaña = makeCampaña("test Campaña");
        expect(Campaña.id).toStrictEqual(0)
        expect(getCampañas('me').length).toStrictEqual(1);    
        expect(getCampañas('').length).toStrictEqual(0);
        expect(getCampañas('me')[0].Campaña.who).toStrictEqual(allcharmian);
        log("Campaña created by: " + getCampañas('me')[0].Campaña.who);    
    });

    it("should create two Campañas by the same creator", () => {
        var Campaña1 = makeCampaña("test Campaña");
        expect(Campaña1.id).toStrictEqual(0)
        var Campaña2 = makeCampaña("test Campaña 2");
        expect(Campaña2.id).toStrictEqual(1)
        expect(getCampañas('me').length).toStrictEqual(2);    
        expect(getCampañas('').length).toStrictEqual(0);
        log("total Campañas created: " + "by " + allcharmian + ": " + getCampañas('me').length.toString());
        log("total Campañas created: " + "by others " + ": " + getCampañas('').length.toString());
    });

    it("should create two Campañas by different creators", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeCampaña("allcharmian's Campaña");
        expect(Campaña1.Campaña.who).toStrictEqual(allcharmian);
        expect(getCampañas('me').length).toStrictEqual(1);    
        expect(getCampañas('').length).toStrictEqual(0);    

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        var Campaña2 = makeCampaña("bravio's Campaña");
        expect(Campaña2.Campaña.who).toStrictEqual(bravio);
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

        var Campaña1 = makeCampaña("allcharmian's Campaña");
        vote(Campaña1.id, true);
    });

    it("should allow to vote for other's public Campaña", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeCampaña("allcharmian's Campaña");

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        Campaña1 = vote(Campaña1.id, true);
        expect(Campaña1.Campaña.vote_yes).toStrictEqual(1);
        expect(Campaña1.Campaña.vote_no).toStrictEqual(0);

        Campaña1 = vote(Campaña1.id, true);
        expect(Campaña1.Campaña.vote_yes).toStrictEqual(1);
        expect(Campaña1.Campaña.vote_no).toStrictEqual(0);

        Campaña1 = vote(Campaña1.id, false);
        expect(Campaña1.Campaña.vote_yes).toStrictEqual(0);
        expect(Campaña1.Campaña.vote_no).toStrictEqual(1);

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        Campaña1 = vote(Campaña1.id, false);
        expect(Campaña1.Campaña.vote_yes).toStrictEqual(0);
        expect(Campaña1.Campaña.vote_no).toStrictEqual(2);

        Campaña1 = vote(Campaña1.id, false);
        expect(Campaña1.Campaña.vote_yes).toStrictEqual(0);
        expect(Campaña1.Campaña.vote_no).toStrictEqual(2);
    });

    itThrows("should disallow Campaña creation with invalid viewers", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeExtendedCampaña("allcharmian's Campaña", ["blablabla"], []);
        vote(Campaña1.id, true);
    });

    itThrows("should disallow Campaña creation with invalid voters", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeExtendedCampaña("allcharmian's Campaña", [], ["blablabla"]);
        vote(Campaña1.id, true);
    });

    itThrows("should create private Campaña with no voters", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio], []);
        vote(Campaña1.id, true);
    });

    itThrows("should disallow to vote for own private Campaña if not in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio], []);
        vote(Campaña1.id, true);
    });

    it("should allow to vote for own private Campaña if in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio, allcharmian], [allcharmian]);
        vote(Campaña1.id, true);
    });

    itThrows("should disallow to vote for other's private Campaña if not in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio, allcharmian], [bravio]);

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        vote(Campaña1.id, true);
    });

    it("should allow to vote for other's private Campaña if in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio, allcharmian], [bravio]);

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        vote(Campaña1.id, true);
    });

    it("should return only private Campañas where in viewers list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var Campaña1 = makeExtendedCampaña("allcharmian's Campaña", [bravio], [bravio, allcharmian, smartio]);
        expect(Campaña1.Campaña.canView.has(bravio)).toStrictEqual(true);
        expect(Campaña1.Campaña.canView.has(allcharmian)).toStrictEqual(true);
        expect(Campaña1.Campaña.canVote.has(bravio)).toStrictEqual(true);
        expect(Campaña1.Campaña.canVote.has(allcharmian)).toStrictEqual(true);

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        var laziosCampañas = getCampañas("others");
        expect(laziosCampañas.length).toStrictEqual(0)

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        var braviosCampañas = getCampañas("others");
        expect(braviosCampañas.length).toStrictEqual(1)

        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var allcharmiansCampañas = getCampañas("others");
        expect(allcharmiansCampañas.length).toStrictEqual(1)

        VMContext.setSigner_account_id(smartio)
        VMContext.setPredecessor_account_id(smartio)

        var smartiosCampañas = getCampañas("others");
        expect(smartiosCampañas.length).toStrictEqual(1)
    });

});
