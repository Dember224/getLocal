import getActBluePage from './findDonationsPage';
import getSuggestions from './analyticsHandlers';

/*
The plan is to write a new test for each endpoint that the frontend hits. 
This should make it easier to identify if anything goes wrong with any of them down the road.
I don't think they need to be too complicated. 
*/
describe('Ensure the frontend is in contact with the api', ()=>{
    test('Is the random district suggestion generator working?', async ()=>{
        try {
            const suggestions = await getSuggestions();
            const lastRepVotes = suggestions.lastRepVotes;
            const lastDemVotes = suggestions.lastDemVotes;
            expect(lastRepVotes && lastDemVotes).toBeTruthy();
        } catch(e) {
            throw new Error(e)
        }
    })

    test('Does the search for a known donation page work?', async ()=>{
        try {
            const candidate_links_object = await getActBluePage('Gwendolyn', 'Stoltz');
            const donation_link = candidate_links_object["donation_link"];
            const candidate_profile = candidate_links_object["candidate_profile"];
            const donate_url = new URL(donation_link);
            const candidate_url = new URL(candidate_profile);
            expect(donate_url.protocol).toBe("https:");
            expect(candidate_url.protocol).toBe("http:")
            
        } catch(e) {
            throw new Error(e);
        }
    })
})