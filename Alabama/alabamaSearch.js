const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const loader = require('../Loaders/uploadFinances.js');

//Republicans are still being rendered here.
//Changing the party on the request call doesn't seem to be doing anything.
//Will have to find a way to filter out the republicans later.
const getSearchSettings = function(callData,callback){
  request({
    uri:'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx?tb=politicalracesearch',
    qs:{
      tb: 'politicalracesearch'
    },
    json:true,
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',

    }
  },(e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    const election = `${callData.year} ELECTION CYCLE`;
    const office = callData.office //STATE SENATOR  OR STATE REPRESENTATIVE all caps
    const party = callData.party; //only first letter caps ex. Democrat
    const form_html = $(".md-form").html();
    const election_number = $(`option:contains(\'${election}')`).attr('value');
    const office_number = $(`option:contains(\'${office}')`).attr('value');
    const party_number =  $(`option:contains(\'${party}')`).attr('value');
    const search_object = {
      election:election_number,
      office:office_number,
      party:party_number
    }
    return callback(null, search_object)
  })
}

const getCandidateMoney = function(callData, callback){

  getSearchSettings({year:callData.year, office:callData.office, party:"Democrat"}, (e,search_object)=>{
    if(e) return e;
    const district = callData.district
    const viewstate = callData.office === "STATE SENATOR" ? "/wEPDwUKLTUwMTY5MDA0MA8WBB4MaW50RXhwb3J0TWF4AqCcAR4LaW50UHJpbnRNYXgC6AcWAmYPZBYKZg9kFgICDw9kFgJmDxYCHgRUZXh0BRVQb2xpdGljYWwgUmFjZSBTZWFyY2hkAgEPDxYGHghDc3NDbGFzcwUSYWN0aXZhdGVkIG5hdi1saW5rHwIFLVNFQVJDSCA8c3BhbiBjbGFzcz0ic3Itb25seSI+KGN1cnJlbnQpPC9zcGFuPh4EXyFTQgICZGQCBA8PFgQfAgUWQ09NTUlUVEVFIFJFR0lTVFJBVElPTh4LTmF2aWdhdGVVcmwFgAFodHRwczovL2ZjcGEuYWxhYmFtYXZvdGVzLmdvdi9DYW1wYWlnbkZpbmFuY2UvRmlsaW5ncy9DRi0xX05vdGljZW9mT3JnYW5pemF0aW9uLmFzcHg/UHVibGljPUExWjJZN0IzLTc5MDEtNTY3Vy1DMVBVLThWNUVVOUVSU0kxMGRkAgUPDxYGHgdUb29sVGlwBSVDbGljayB0byBsb2cgaW50byB0aGUgdXNlciB3b3Jrc3BhY2UuHwIFQjxpIGNsYXNzPSdmYXMgZmEtMnggZmEtdXNlci1jaXJjbGUnPjwvaT48L2JyPlJlZ2lzdGVyZWQgVXNlciBMb2dpbh8FBTxodHRwczovL2ZjcGEuYWxhYmFtYXZvdGVzLmdvdi9DYW1wYWlnbkZpbmFuY2UvVXNlckxvZ2luLmFzcHhkZAIGDxYCHgVzdHlsZQUWYmFja2dyb3VuZC1jb2xvcjojRkZGOxYYAgEPZBYGAgUPZBYCZg9kFgJmD2QWAmYPZBYWZg8PFgYfAgUESG9tZR8GBSZDbGljayBoZXJlIHRvIHJldHVybiB0byB0aGUgaG9tZSBwYWdlLh4HVmlzaWJsZWdkZAIBDw8WBB8CBQMgPiAfCGdkZAICDw8WBh8CBQZTZWFyY2gfBgUoQ2xpY2sgaGVyZSB0byByZXR1cm4gdG8gdGhlIHNlYXJjaCBwYWdlLh8IZ2RkAgMPDxYEHwIFAyA+IB8IZ2RkAgQPDxYEHwIFB0xldmVsIDIfCGhkZAIFDw8WBB8CBQMgPiAfCGhkZAIGDw8WBB8CBQdMZXZlbCAzHwhoZGQCBw8PFgQfAgUDID4gHwhoZGQCCA8PFgQfAgUHTGV2ZWwgNB8IaGRkAgkPDxYEHwIFAyA+IB8IaGRkAgoPDxYEHwIFD1BvbGl0aWNhbCBSYWNlcx8IZ2RkAgcPDxYCHwIFFVBvbGl0aWNhbCBSYWNlIFNlYXJjaGRkAgkPDxYGHwhnHwIFvQENCiAgICAgICAgICAgICAgICANCiAgICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEgZmEtcXVlc3Rpb24tY2lyY2xlIiBhcmlhLWhpZGRlbj0idHJ1ZSIgc3R5bGU9ImZvbnQtd2VpZ2h0OiBib2xkO2ZvbnQtc2l6ZTogMTVweDtwYWRkaW5nOiA0cHggNHB4OyI+PC9pPg0KICAgICAgICAgICAgICAgIEhlbHAgd2l0aCB0aGlzIHBhZ2UfBQVraHR0cHM6Ly9mY3BhLmFsYWJhbWF2b3Rlcy5nb3YvQ2FtcGFpZ25GaW5hbmNlL1dlYkhlbHAvUHVibGljXFB1YmxpY1NpdGVcU2VhcmNoUGFnZXNcUG9saXRpY2FsUmFjZVNlYXJjaC5odG1kZAIDDw8WAh8CZWRkAgUPDxYCHwJlZGQCBw8QZBAVABUAFCsDABYAZAIJDw8WAh8CZWRkAgsPEGQQFQAVABQrAwAWAGQCEw9kFgJmDw8WBh8FBRcvUHVibGljU2l0ZS9TZWFyY2guYXNweB8DBQlhY3RpdmF0ZWQfBAICZBYCZg8PFgYfAgUGU2VhcmNoHwMFCWFjdGl2YXRlZB8EAgJkZAIVD2QWAmYPDxYCHwUFGi9QdWJsaWNTaXRlL1Jlc291cmNlcy5hc3B4ZBYCZg8PFgIfAgUJUmVzb3VyY2VzZGQCFw9kFgJmDw8WAh8FBSAvUHVibGljU2l0ZS9SZXBvcnRzL1JlcG9ydHMuYXNweGQWAmYPDxYCHwIFB1JlcG9ydHNkZAIZD2QWAmYPDxYCHwUFGy9QdWJsaWNTaXRlL1F1aWNrU3RhdHMuYXNweGQWAmYPDxYCHwIFC1F1aWNrIFN0YXRzZGQCIw9kFgJmD2QWBAIHDxBkZBYAZAILDxBkZBYAZAIlD2QWBGYPZBYCAgEPZBYCZg9kFgoCAQ8UKwACEGQQFWUSU2VsZWN0IEVsZWN0aW9uLi4uKTIwMjEgVFVTQ0FMT09TQSBNVU5JQ0lQQUwgUlVOT0ZGIEVMRUNUSU9OIjIwMjEgVFVTQ0FMT09TQSBNVU5JQ0lQQUwgRUxFQ1RJT04pMjAyMSBTRDE0IFNQRUNJQUwgUFJJTUFSWSBSVU5PRkYgRUxFQ1RJT04uMjAyMSBTRDE0IFNQRUNJQUwgUFJJTUFSWSBBTkQgR0VORVJBTCBFTEVDVElPTjwyMDIxIE1BUlNIQUxMIENPVU5UWSAtIENIRVJPS0VFIFJJREdFIElOQ09SUE9SQVRJT04gRUxFQ1RJT048MjAyMSBMRUUgQ09VTlRZIEJFQVQgMTMgWk9OSU5HIEFORCBQTEFOTklORyBTUEVDSUFMIEVMRUNUSU9OLjIwMjEgSEQ3OCBTUEVDSUFMIFBSSU1BUlkgQU5EIEdFTkVSQUwgRUxFQ1RJT04pMjAyMSBIRDczIFNQRUNJQUwgUFJJTUFSWSBSVU5PRkYgRUxFQ1RJT04uMjAyMSBIRDczIFNQRUNJQUwgUFJJTUFSWSBBTkQgR0VORVJBTCBFTEVDVElPTh4yMDIxIERPVEhBTiBNVU5JQ0lQQUwgRUxFQ1RJT04+MjAyMSBDSVRZIE9GIEdVTlRFUlNWSUxMRSAtIEFEIFZBTE9SRU0gVEFYIEZPUiBTQ0hPT0wgUFVSUE9TRVMxMjAyMSBCSVJNSU5HSEFNIEFORC9PUiBNT0JJTEUgTVVOSUNJUEFMIEVMRUNUSU9OU0AyMDIxIEJBTERXSU4gQ09VTlRZIC0gUFJFQ0lOQ1QgMzYgLSBQTEFOTklORyBBTkQgWk9OSU5HIEVMRUNUSU9OKTIwMjAgU0QyNiBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEVMRUNUSU9OLjIwMjAgU0QyNiBTUEVDSUFMIFBSSU1BUlkgQU5EIEdFTkVSQUwgRUxFQ1RJT04eMjAyMCBNVU5JQ0lQQUwgUlVOT0ZGIEVMRUNUSU9OFzIwMjAgTVVOSUNJUEFMIEVMRUNUSU9OKTIwMjAgSEQ0OSBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEVMRUNUSU9OIjIwMjAgSEQ0OSBTUEVDSUFMIFBSSU1BUlkgRUxFQ1RJT04iMjAyMCBIRDQ5IFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTi4yMDIwIEhEMzMgU1BFQ0lBTCBQUklNQVJZIEFORCBHRU5FUkFMIEVMRUNUSU9ODTIwMjAgRUxFQ1RJT040MjAyMCBDSVRZIE9GIFNVTUlUT04gLSBTVU5EQVkgQUxDT0hPTCBTQUxFUyBFTEVDVElPTjAyMDIwIENISUxUT04gQ09VTlRZIC1TUEVDSUFMIFNDSE9PTCBUQVggRUxFQ1RJT05UMjAyMCBDQUhBQkEgVkFMTEVZIEZJUkUgJiBFTUVSR0VOQ1kgUkVTQ1VFIERJU1RSSUNULVBST1BPU0VEIFNFUlZJQ0UgQ0hBUkdFIEVMRUNUSU9OHjIwMTkgVE9XTiBPRiBUUklBTkEgUkVGRVJFTkRVTTQyMDE5IE1PTlRHT01FUlkgQU5EL09SIFRBTExBREVHQSBNVU5JQ0lQQUwgRUxFQ1RJT05TMTIwMTkgTUFSRU5HTyBDT1VOVFktU1BFQ0lBTCBIT1NQSVRBTCBUQVggRUxFQ1RJT04hMjAxOSBMQVVERVJEQUxFIENPVU5UWSBSRUZFUkVORFVNPTIwMTkgSEQ3NCBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEFORCBTUEVDSUFMIEdFTkVSQUwgRUxFQ1RJT04nMjAxOSBIRDc0IFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTiBPTkxZIjIwMTkgSEQ3NCBTUEVDSUFMIEVMRUNUSU9OIFBSSU1BUlkiMjAxOSBIRDQyIFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTiIyMDE5IEhENDIgU1BFQ0lBTCBFTEVDVElPTiBQUklNQVJZMTIwMTkgSEQ0MiBTUEVDSUFMIEVMRUNUSU9OIEdFTkVSQUwtTk9UIFRPIEJFIFVTRUQbMjAxOSBDTEFZIENPVU5UWSBSRUZFUkVORFVNMzIwMTkgQ0lUWSBPRiBUVVNDQUxPT1NBIFNQRUNJQUwgRUxFQ1RJT04gRElTVFJJQ1QgNDAyMDE5IENJVFkgT0YgVEFMTEFERUdBIE1VTklDSVBBTCBSVU5PRkYgRUxFQ1RJT04eMjAxOSBDSVRZIE9GIE9YRk9SRCBSRUZFUkVORFVNLzIwMTkgQ0lUWSBPRiBNT1VOVEFJTiBCUk9PSyBBRCBWQUxPUkVNIEVMRUNUSU9OMTIwMTkgQ0lUWSBPRiBNT05UR09NRVJZIE1VTklDSVBBTCBSVU5PRkYgRUxFQ1RJT04fMjAxOSBDSVRZIE9GIE1BRElTT04gUkVGRVJFTkRVTTcyMDE5IENJVFkgT0YgSFVOVFNWSUxMRS1TUEVDSUFMIFBST1BFUlRZIFRBWCBSRUZFUkVORFVNIjIwMTkgQ0lUWSBPRiBFTlRFUlBSSVNFIFJFRkVSRU5EVU1BMjAxOSBDSVRZIE9GIEJJUk1JTkdIQU0tU1BFQ0lBTCBNVU5JQ0lQQUwgQU5EIFJFRkVSRU5EVU0gRUxFQ1RJT047MjAxOSBDSVRZIE9GIEJJUk1JTkdIQU0gLSBTUEVDSUFMIE1VTklDSVBBTCBSVU5PRkYgRUxFQ1RJT04eMjAxOSBDSVRZIE9GIEFVQlVSTiBSRUZFUkVORFVNOjIwMTkgQkFMRFdJTiBDT1VOVFkgLSBTUEVDSUFMIFNDSE9PTCBUQVggRElTVFJJQ1QgRUxFQ1RJT04rMjAxOCBPQ1RPQkVSIDlUSCBNVU5JQ0lQQUwgUlVOT0ZGIEVMRUNUSU9OUyoyMDE4IE1VU0NMRSBTSE9BTFMgUFJPUEVSVFkgVEFYIFJFRkVSRU5EVU0XMjAxOCBNVU5JQ0lQQUwgRUxFQ1RJT04iMjAxOCBIRDIxIFNQRUNJQUwgR0VORVJBTCBFTEVDVElPThMyMDE4IEVMRUNUSU9OIENZQ0xFJDIwMTggQVVHVVNUIDI4VEggTVVOSUNJUEFMIEVMRUNUSU9OUy0yMDE3IFNQRUNJQUwgTVVOSUNJUEFMIEVMRUNUSU9OIChQSEVOSVggQ0lUWSk9MjAxNyBTRDI2IFNQRUNJQUwgUFJJTUFSWSBSVU5PRkYgQU5EIFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTiIyMDE3IFNEMjYgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OKzIwMTcgTVVOSUNJUEFMIFJVTk9GRiBFTEVDVElPTiAoVFVTQ0FMT09TQSkrMjAxNyBNVU5JQ0lQQUwgUlVOT0ZGIEVMRUNUSU9OIChCSVJNSU5HSEFNKSQyMDE3IE1VTklDSVBBTCBFTEVDVElPTiAoVFVTQ0FMT09TQSkgMjAxNyBNVU5JQ0lQQUwgRUxFQ1RJT04gKERPVEhBTiktMjAxNyBNVU5JQ0lQQUwgRUxFQ1RJT04gKEJJUk1JTkdIQU0gJiBNT0JJTEUpHjIwMTcgTUFESVNPTiBDT1VOVFkgUkVGRVJFTkRVTSIyMDE3IEhENjcgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OIjIwMTcgSEQ2NyBTUEVDSUFMIEdFTkVSQUwgRUxFQ1RJT04iMjAxNyBIRDU4IFNQRUNJQUwgUFJJTUFSWSBFTEVDVElPTjwyMDE3IEhENCBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEFORCBTUEVDSUFMIEdFTkVSQUwgRUxFQ1RJT04hMjAxNyBIRDQgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OHjIwMTcgQkFMRFdJTiBDT1VOVFkgUkVGRVJFTkRVTScyMDE2IFJFR1VMQVIgTVVOSUNJUEFMIFJVTk9GRiBFTEVDVElPTlMgMjAxNiBSRUdVTEFSIE1VTklDSVBBTCBFTEVDVElPTlMkMjAxNiBNVU5JQ0lQQUwgRUxFQ1RJT04gKEVOVEVSUFJJU0UpIjIwMTYgSEQ4MCBTUEVDSUFMIFBSSU1BUlkgRUxFQ1RJT04iMjAxNiBIRDc5IFNQRUNJQUwgUFJJTUFSWSBFTEVDVElPTiIyMDE2IEhENDEgU1BFQ0lBTCBHRU5FUkFMIEVMRUNUSU9OEzIwMTYgRUxFQ1RJT04gQ1lDTEUWMjAxNiBBTCBFTEVDVElPTiBDWUNMRTIyMDE1IE1VTklDSVBBTCBFTEVDVElPTiAoTU9OVEdPTUVSWSBBTkQgVEFMTEFERUdBKSAyMDE1IE1VTklDSVBBTCBFTEVDVElPTiAoQVRIRU5TKSgyMDE1IEpBQ0tTT04gQ09VTlRZIFNQRUNJQUwgVEFYIEVMRUNUSU9OKTIwMTUgSEQwNSBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEVMRUNUSU9OIjIwMTUgSEQwNSBTUEVDSUFMIFBSSU1BUlkgRUxFQ1RJT04iMjAxNSBIRDA1IFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTicyMDE1IENPTEJFUlQgQ09VTlRZIFNDSE9PTCBUQVggRUxFQ1RJT04nMjAxNSBCQUxEV0lOIENPVU5UWSBTQ0hPT0wgVEFYIEVMRUNUSU9OEzIwMTQgRUxFQ1RJT04gQ1lDTEUnMjAxMyBSVU5PRkYgTVVOSUNJUEFMIEVMRUNUSU9OIChET1RIQU4pQDIwMTMgUlVOT0ZGIE1VTklDSVBBTCBFTEVDVElPTiAoQklSTUlOR0hBTSwgTU9CSUxFICYgVFVTQ0FMT09TQSkgMjAxMyBNVU5JQ0lQQUwgRUxFQ1RJT04gKERPVEhBTik5MjAxMyBNVU5JQ0lQQUwgRUxFQ1RJT04gKEJJUk1JTkdIQU0sIE1PQklMRSAmIFRVU0NBTE9PU0EpITIwMTMgSEQ3NCBTUEVDSUFMIFJVTk9GRiBFTEVDVElPTiIyMDEzIEhENzQgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OITIwMTMgSEQ1MyBTUEVDSUFMIFJVTk9GRiBFTEVDVElPTiIyMDEzIEhENTMgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OIjIwMTMgSEQ1MyBTUEVDSUFMIEdFTkVSQUwgRUxFQ1RJT04hMjAxMyBIRDMxIFNQRUNJQUwgUlVOT0ZGIEVMRUNUSU9OIjIwMTMgSEQzMSBTUEVDSUFMIFBSSU1BUlkgRUxFQ1RJT04iMjAxMyBIRDEwNCBTUEVDSUFMIFJVTk9GRiBFTEVDVElPTiMyMDEzIEhEMTA0IFNQRUNJQUwgUFJJTUFSWSBFTEVDVElPTiMyMDEzIEhEMTA0IFNQRUNJQUwgR0VORVJBTCBFTEVDVElPThVlATADMjMxAzIxNgMyMjUDMjI0AzIzMwMyMzADMjI5AzIyNwMyMjYDMjE3AzIzNAMyMTgDMjMyAzIyMwMyMjIDMjIxAzE4NwMyMTQDMjEzAzIxNQMyMTkDMTg4AzIxMgMyMTEDMjIwAzE5OQMxODYDMjA5AzIwMgMxOTADMTkxAzE4OQMxOTQDMTkzAzE5NQMyMDEDMjA1AzIwOAMxOTcDMjA2AzIwNAMxOTIDMjA3AzIwMAMyMDMDMjEwAzE5OAMxOTYDMTg0AzE4MQMxNzUDMTc2AzE2OQMxODIDMTc0AzE4MAMxNzMDMTcwAzE3MQMxNjQDMTY1AzE2NgMxNzgDMTYzAzE2OAMxNjcDMTc5AzE3MgMxNzcDMTYyAzE1OQMxNTYDMTU3AzE2MAMxNjEDMTQ0AzE1OAMxNDYDMTUxAzE1MwMxNTQDMTUyAzE1NQMxNDcDMTQ1AzEyOAMxMzIDMTMxAzEzMAMxMjkDMTM4AzEzMwMxNDIDMTM2AzE0MwMxNDEDMTM3AzEzOQMxMzUDMTQwFCsDZWdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnFgECNWRkAgMPFCsAAhAPFgYeDURhdGFUZXh0RmllbGQFC0Rlc2NyaXB0aW9uHg5EYXRhVmFsdWVGaWVsZAUMT2ZmaWNlQ29kZUlEHgtfIURhdGFCb3VuZGdkEBUpE1NlbGVjdCBhbiBPZmZpY2UuLi4WQVNTSVNUQU5UIFRBWCBBU1NFU1NPUhdBU1NJU1RBTlQgVEFYIENPTExFQ1RPUhBBVFRPUk5FWSBHRU5FUkFMDUNJUkNVSVQgQ0xFUksTQ0lSQ1VJVCBDT1VSVCBKVURHRShDT01NSVNTSU9ORVIgT0YgQUdSSUNVTFRVUkUgJiBJTkRVU1RSSUVTGUNPVU5UWSBCT0FSRCBPRiBFRFVDQVRJT04XQ09VTlRZIENPTU1JU1NJT04gQ0hBSVIbQ09VTlRZIENPTU1JU1NJT04gUFJFU0lERU5UE0NPVU5UWSBDT01NSVNTSU9ORVIQQ09VTlRZIENPTlNUQUJMRQ5DT1VOVFkgQ09ST05FUiJDT1VOVFkgU1VQRVJJTlRFTkRFTlQgT0YgRURVQ0FUSU9OEENPVU5UWSBUUkVBU1VSRVIcQ09VUlQgT0YgQ0lWSUwgQVBQRUFMUyBKVURHRR9DT1VSVCBPRiBDUklNSU5BTCBBUFBFQUxTIEpVREdFEERFUFVUWSBUUkVBU1VSRVIRRElTVFJJQ1QgQVRUT1JORVkURElTVFJJQ1QgQ09VUlQgSlVER0UIR09WRVJOT1IUTElDRU5TRSBDT01NSVNTSU9ORVIQTElDRU5TRSBESVJFQ1RPUgxMVC4gR09WRVJOT1IqUFJFU0lERU5UIE9GIFRIRSBQVUJMSUMgU0VSVklDRSBDT01NSVNTSU9ODVBST0JBVEUgSlVER0UZUFJPUEVSVFkgVEFYIENPTU1JU1NJT05FUhtQVUJMSUMgU0VSVklDRSBDT01NSVNTSU9ORVIUUkVWRU5VRSBDT01NSVNTSU9ORVISU0VDUkVUQVJZIE9GIFNUQVRFB1NIRVJJRkYNU1RBVEUgQVVESVRPUhhTVEFURSBCT0FSRCBPRiBFRFVDQVRJT04UU1RBVEUgUkVQUkVTRU5UQVRJVkUNU1RBVEUgU0VOQVRPUg9TVEFURSBUUkVBU1VSRVIfU1VQUkVNRSBDT1VSVCBBU1NPQ0lBVEUgSlVTVElDRRtTVVBSRU1FIENPVVJUIENISUVGIEpVU1RJQ0UMVEFYIEFTU0VTU09SFlRBWCBBU1NFU1NPUi9DT0xMRUNUT1INVEFYIENPTExFQ1RPUhUpATACNTkCNTgCMTYCMjkCMjgCMjECNTECNDcCNDgCNDYCNTUCNTACNTMCNDMCMjYCMjcCNTQCMjQCMjUCMTMCNDUCNTcCMTQCMjMCNDkCNTYCMjICNDQCMTUCMzgCMTgCMjACMTkCMzICMTcCMzECMzACNDACNDICNDEUKwMpZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2cWAQIiZGQCBQ8UKwACEA8WCB8JBQtEZXNjcmlwdGlvbh8KBQpEaXN0cmljdElEHwtnHgdFbmFibGVkZ2QQFSQYU2VsZWN0IGEgSnVyaXNkaWN0aW9uLi4uEVNFTkFURSBESVNUUklDVCAxEVNFTkFURSBESVNUUklDVCAyEVNFTkFURSBESVNUUklDVCAzEVNFTkFURSBESVNUUklDVCA0EVNFTkFURSBESVNUUklDVCA1EVNFTkFURSBESVNUUklDVCA2EVNFTkFURSBESVNUUklDVCA3EVNFTkFURSBESVNUUklDVCA4EVNFTkFURSBESVNUUklDVCA5ElNFTkFURSBESVNUUklDVCAxMBJTRU5BVEUgRElTVFJJQ1QgMTESU0VOQVRFIERJU1RSSUNUIDEyElNFTkFURSBESVNUUklDVCAxMxJTRU5BVEUgRElTVFJJQ1QgMTQSU0VOQVRFIERJU1RSSUNUIDE1ElNFTkFURSBESVNUUklDVCAxNhJTRU5BVEUgRElTVFJJQ1QgMTcSU0VOQVRFIERJU1RSSUNUIDE4ElNFTkFURSBESVNUUklDVCAxORJTRU5BVEUgRElTVFJJQ1QgMjASU0VOQVRFIERJU1RSSUNUIDIxElNFTkFURSBESVNUUklDVCAyMhJTRU5BVEUgRElTVFJJQ1QgMjMSU0VOQVRFIERJU1RSSUNUIDI0ElNFTkFURSBESVNUUklDVCAyNRJTRU5BVEUgRElTVFJJQ1QgMjYSU0VOQVRFIERJU1RSSUNUIDI3ElNFTkFURSBESVNUUklDVCAyOBJTRU5BVEUgRElTVFJJQ1QgMjkSU0VOQVRFIERJU1RSSUNUIDMwElNFTkFURSBESVNUUklDVCAzMRJTRU5BVEUgRElTVFJJQ1QgMzISU0VOQVRFIERJU1RSSUNUIDMzElNFTkFURSBESVNUUklDVCAzNBJTRU5BVEUgRElTVFJJQ1QgMzUVJAEwATkCMTACMTECMTICMTMCMTQCMTUCMTYCMTcCMTgCMTkCMjACMjECMjICMjMCMjQCMjUCMjYCMjcCMjgCMjkCMzACMzECMzICMzMCMzQCMzUCMzYCMzcCMzgCMzkCNDACNDECNDICNDMUKwMkZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnFgFmZGQCBw9kFgRmDxAPFgofCgUGQ29kZUlEHwkFC0Rlc2NyaXB0aW9uHgVXaWR0aBsAAAAAAMByQAEAAAAfC2cfBAKAAmQQFQgVU2VsZWN0IGFsbCBwYXJ0aWVzLi4uDENvbnN0aXR1dGlvbghEZW1vY3JhdAtJbmRlcGVuZGVudAtMaWJlcnRhcmlhbgpSZXB1YmxpY2FuElRoZSBQZW9wbGUncyBQYXJ0eQhXcml0ZS1JbhUIAi0xAjIwATICMTkCMjIBNQIyMwIyMRQrAwhnZ2dnZ2dnZ2RkAgIPDxYEHwIFASofDGdkZAIJDxQrAAIQZA8WCmYCAQICAgMCBAIFAgYCBwIIAgkWChAFDlNlbGVjdCBZZWFyLi4uBQEwZxAFBDIwMTMFBDIwMTNnEAUEMjAxNAUEMjAxNGcQBQQyMDE1BQQyMDE1ZxAFBDIwMTYFBDIwMTZnEAUEMjAxNwUEMjAxN2cQBQQyMDE4BQQyMDE4ZxAFBDIwMTkFBDIwMTlnEAUEMjAyMAUEMjAyMGcQBQQyMDIxBQQyMDIxZxYBZmRkAgEPZBYCAiEPFCsAAjwrAA0AMpoDAAEAAAD/////AQAAAAAAAAAMAgAAAEZRQ3VzdG9tQ29udHJvbHMsIFZlcnNpb249MS4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1udWxsBQEAAAAvUUN1c3RvbUNvbnRyb2xzLlFHcmlkVmlld1BhZ2VkK1ZpZXdTdGF0ZVdyYXBwZXIHAAAAKDxEaXNwbGF5UGFnZVNpemVEcm9wRG93bj5rX19CYWNraW5nRmllbGQfPERlZmF1bHRTb3J0Q29sPmtfX0JhY2tpbmdGaWVsZBg8U29ydENvbD5rX19CYWNraW5nRmllbGQYPFNvcnREaXI+a19fQmFja2luZ0ZpZWxkGjxUb3RhbFJvd3M+a19fQmFja2luZ0ZpZWxkGjxQYWdlSW5kZXg+a19fQmFja2luZ0ZpZWxkGTxQYWdlU2l6ZT5rX19CYWNraW5nRmllbGQAAQEBAAAAAQgICAIAAAABBgMAAAAIQ2FuZE5hbWUJAwAAAAYEAAAAA0FTQwAAAAAAAAAACgAAAAtkGAEFHl9jdGwwOkNvbnRlbnQ6ZGdkU2VhcmNoUmVzdWx0cw9nZDD0jJWltHtG9e7UABHahP5pi7tm" : "/wEPDwUKLTUwMTY5MDA0MA8WBB4MaW50RXhwb3J0TWF4AqCcAR4LaW50UHJpbnRNYXgC6AcWAmYPZBYKZg9kFgICDw9kFgJmDxYCHgRUZXh0BRVQb2xpdGljYWwgUmFjZSBTZWFyY2hkAgEPDxYGHghDc3NDbGFzcwUSYWN0aXZhdGVkIG5hdi1saW5rHwIFLVNFQVJDSCA8c3BhbiBjbGFzcz0ic3Itb25seSI+KGN1cnJlbnQpPC9zcGFuPh4EXyFTQgICZGQCBA8PFgQfAgUWQ09NTUlUVEVFIFJFR0lTVFJBVElPTh4LTmF2aWdhdGVVcmwFgAFodHRwczovL2ZjcGEuYWxhYmFtYXZvdGVzLmdvdi9DYW1wYWlnbkZpbmFuY2UvRmlsaW5ncy9DRi0xX05vdGljZW9mT3JnYW5pemF0aW9uLmFzcHg/UHVibGljPUExWjJZN0IzLTc5MDEtNTY3Vy1DMVBVLThWNUVVOUVSU0kxMGRkAgUPDxYGHgdUb29sVGlwBSVDbGljayB0byBsb2cgaW50byB0aGUgdXNlciB3b3Jrc3BhY2UuHwIFQjxpIGNsYXNzPSdmYXMgZmEtMnggZmEtdXNlci1jaXJjbGUnPjwvaT48L2JyPlJlZ2lzdGVyZWQgVXNlciBMb2dpbh8FBTxodHRwczovL2ZjcGEuYWxhYmFtYXZvdGVzLmdvdi9DYW1wYWlnbkZpbmFuY2UvVXNlckxvZ2luLmFzcHhkZAIGDxYCHgVzdHlsZQUWYmFja2dyb3VuZC1jb2xvcjojRkZGOxYYAgEPZBYGAgUPZBYCZg9kFgJmD2QWAmYPZBYWZg8PFgYfAgUESG9tZR8GBSZDbGljayBoZXJlIHRvIHJldHVybiB0byB0aGUgaG9tZSBwYWdlLh4HVmlzaWJsZWdkZAIBDw8WBB8CBQMgPiAfCGdkZAICDw8WBh8CBQZTZWFyY2gfBgUoQ2xpY2sgaGVyZSB0byByZXR1cm4gdG8gdGhlIHNlYXJjaCBwYWdlLh8IZ2RkAgMPDxYEHwIFAyA+IB8IZ2RkAgQPDxYEHwIFB0xldmVsIDIfCGhkZAIFDw8WBB8CBQMgPiAfCGhkZAIGDw8WBB8CBQdMZXZlbCAzHwhoZGQCBw8PFgQfAgUDID4gHwhoZGQCCA8PFgQfAgUHTGV2ZWwgNB8IaGRkAgkPDxYEHwIFAyA+IB8IaGRkAgoPDxYEHwIFD1BvbGl0aWNhbCBSYWNlcx8IZ2RkAgcPDxYCHwIFFVBvbGl0aWNhbCBSYWNlIFNlYXJjaGRkAgkPDxYGHwhnHwIFvQENCiAgICAgICAgICAgICAgICANCiAgICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEgZmEtcXVlc3Rpb24tY2lyY2xlIiBhcmlhLWhpZGRlbj0idHJ1ZSIgc3R5bGU9ImZvbnQtd2VpZ2h0OiBib2xkO2ZvbnQtc2l6ZTogMTVweDtwYWRkaW5nOiA0cHggNHB4OyI+PC9pPg0KICAgICAgICAgICAgICAgIEhlbHAgd2l0aCB0aGlzIHBhZ2UfBQVraHR0cHM6Ly9mY3BhLmFsYWJhbWF2b3Rlcy5nb3YvQ2FtcGFpZ25GaW5hbmNlL1dlYkhlbHAvUHVibGljXFB1YmxpY1NpdGVcU2VhcmNoUGFnZXNcUG9saXRpY2FsUmFjZVNlYXJjaC5odG1kZAIDDw8WAh8CZWRkAgUPDxYCHwJlZGQCBw8QZBAVABUAFCsDABYAZAIJDw8WAh8CZWRkAgsPEGQQFQAVABQrAwAWAGQCEw9kFgJmDw8WBh8FBRcvUHVibGljU2l0ZS9TZWFyY2guYXNweB8DBQlhY3RpdmF0ZWQfBAICZBYCZg8PFgYfAgUGU2VhcmNoHwMFCWFjdGl2YXRlZB8EAgJkZAIVD2QWAmYPDxYCHwUFGi9QdWJsaWNTaXRlL1Jlc291cmNlcy5hc3B4ZBYCZg8PFgIfAgUJUmVzb3VyY2VzZGQCFw9kFgJmDw8WAh8FBSAvUHVibGljU2l0ZS9SZXBvcnRzL1JlcG9ydHMuYXNweGQWAmYPDxYCHwIFB1JlcG9ydHNkZAIZD2QWAmYPDxYCHwUFGy9QdWJsaWNTaXRlL1F1aWNrU3RhdHMuYXNweGQWAmYPDxYCHwIFC1F1aWNrIFN0YXRzZGQCIw9kFgJmD2QWBAIHDxBkZBYAZAILDxBkZBYAZAIlD2QWBGYPZBYCAgEPZBYCZg9kFgoCAQ8UKwACEGQQFWUSU2VsZWN0IEVsZWN0aW9uLi4uKTIwMjEgVFVTQ0FMT09TQSBNVU5JQ0lQQUwgUlVOT0ZGIEVMRUNUSU9OIjIwMjEgVFVTQ0FMT09TQSBNVU5JQ0lQQUwgRUxFQ1RJT04pMjAyMSBTRDE0IFNQRUNJQUwgUFJJTUFSWSBSVU5PRkYgRUxFQ1RJT04uMjAyMSBTRDE0IFNQRUNJQUwgUFJJTUFSWSBBTkQgR0VORVJBTCBFTEVDVElPTjwyMDIxIE1BUlNIQUxMIENPVU5UWSAtIENIRVJPS0VFIFJJREdFIElOQ09SUE9SQVRJT04gRUxFQ1RJT048MjAyMSBMRUUgQ09VTlRZIEJFQVQgMTMgWk9OSU5HIEFORCBQTEFOTklORyBTUEVDSUFMIEVMRUNUSU9OLjIwMjEgSEQ3OCBTUEVDSUFMIFBSSU1BUlkgQU5EIEdFTkVSQUwgRUxFQ1RJT04pMjAyMSBIRDczIFNQRUNJQUwgUFJJTUFSWSBSVU5PRkYgRUxFQ1RJT04uMjAyMSBIRDczIFNQRUNJQUwgUFJJTUFSWSBBTkQgR0VORVJBTCBFTEVDVElPTh4yMDIxIERPVEhBTiBNVU5JQ0lQQUwgRUxFQ1RJT04+MjAyMSBDSVRZIE9GIEdVTlRFUlNWSUxMRSAtIEFEIFZBTE9SRU0gVEFYIEZPUiBTQ0hPT0wgUFVSUE9TRVMxMjAyMSBCSVJNSU5HSEFNIEFORC9PUiBNT0JJTEUgTVVOSUNJUEFMIEVMRUNUSU9OU0AyMDIxIEJBTERXSU4gQ09VTlRZIC0gUFJFQ0lOQ1QgMzYgLSBQTEFOTklORyBBTkQgWk9OSU5HIEVMRUNUSU9OKTIwMjAgU0QyNiBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEVMRUNUSU9OLjIwMjAgU0QyNiBTUEVDSUFMIFBSSU1BUlkgQU5EIEdFTkVSQUwgRUxFQ1RJT04eMjAyMCBNVU5JQ0lQQUwgUlVOT0ZGIEVMRUNUSU9OFzIwMjAgTVVOSUNJUEFMIEVMRUNUSU9OKTIwMjAgSEQ0OSBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEVMRUNUSU9OIjIwMjAgSEQ0OSBTUEVDSUFMIFBSSU1BUlkgRUxFQ1RJT04iMjAyMCBIRDQ5IFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTi4yMDIwIEhEMzMgU1BFQ0lBTCBQUklNQVJZIEFORCBHRU5FUkFMIEVMRUNUSU9ODTIwMjAgRUxFQ1RJT040MjAyMCBDSVRZIE9GIFNVTUlUT04gLSBTVU5EQVkgQUxDT0hPTCBTQUxFUyBFTEVDVElPTjAyMDIwIENISUxUT04gQ09VTlRZIC1TUEVDSUFMIFNDSE9PTCBUQVggRUxFQ1RJT05UMjAyMCBDQUhBQkEgVkFMTEVZIEZJUkUgJiBFTUVSR0VOQ1kgUkVTQ1VFIERJU1RSSUNULVBST1BPU0VEIFNFUlZJQ0UgQ0hBUkdFIEVMRUNUSU9OHjIwMTkgVE9XTiBPRiBUUklBTkEgUkVGRVJFTkRVTTQyMDE5IE1PTlRHT01FUlkgQU5EL09SIFRBTExBREVHQSBNVU5JQ0lQQUwgRUxFQ1RJT05TMTIwMTkgTUFSRU5HTyBDT1VOVFktU1BFQ0lBTCBIT1NQSVRBTCBUQVggRUxFQ1RJT04hMjAxOSBMQVVERVJEQUxFIENPVU5UWSBSRUZFUkVORFVNPTIwMTkgSEQ3NCBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEFORCBTUEVDSUFMIEdFTkVSQUwgRUxFQ1RJT04nMjAxOSBIRDc0IFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTiBPTkxZIjIwMTkgSEQ3NCBTUEVDSUFMIEVMRUNUSU9OIFBSSU1BUlkiMjAxOSBIRDQyIFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTiIyMDE5IEhENDIgU1BFQ0lBTCBFTEVDVElPTiBQUklNQVJZMTIwMTkgSEQ0MiBTUEVDSUFMIEVMRUNUSU9OIEdFTkVSQUwtTk9UIFRPIEJFIFVTRUQbMjAxOSBDTEFZIENPVU5UWSBSRUZFUkVORFVNMzIwMTkgQ0lUWSBPRiBUVVNDQUxPT1NBIFNQRUNJQUwgRUxFQ1RJT04gRElTVFJJQ1QgNDAyMDE5IENJVFkgT0YgVEFMTEFERUdBIE1VTklDSVBBTCBSVU5PRkYgRUxFQ1RJT04eMjAxOSBDSVRZIE9GIE9YRk9SRCBSRUZFUkVORFVNLzIwMTkgQ0lUWSBPRiBNT1VOVEFJTiBCUk9PSyBBRCBWQUxPUkVNIEVMRUNUSU9OMTIwMTkgQ0lUWSBPRiBNT05UR09NRVJZIE1VTklDSVBBTCBSVU5PRkYgRUxFQ1RJT04fMjAxOSBDSVRZIE9GIE1BRElTT04gUkVGRVJFTkRVTTcyMDE5IENJVFkgT0YgSFVOVFNWSUxMRS1TUEVDSUFMIFBST1BFUlRZIFRBWCBSRUZFUkVORFVNIjIwMTkgQ0lUWSBPRiBFTlRFUlBSSVNFIFJFRkVSRU5EVU1BMjAxOSBDSVRZIE9GIEJJUk1JTkdIQU0tU1BFQ0lBTCBNVU5JQ0lQQUwgQU5EIFJFRkVSRU5EVU0gRUxFQ1RJT047MjAxOSBDSVRZIE9GIEJJUk1JTkdIQU0gLSBTUEVDSUFMIE1VTklDSVBBTCBSVU5PRkYgRUxFQ1RJT04eMjAxOSBDSVRZIE9GIEFVQlVSTiBSRUZFUkVORFVNOjIwMTkgQkFMRFdJTiBDT1VOVFkgLSBTUEVDSUFMIFNDSE9PTCBUQVggRElTVFJJQ1QgRUxFQ1RJT04rMjAxOCBPQ1RPQkVSIDlUSCBNVU5JQ0lQQUwgUlVOT0ZGIEVMRUNUSU9OUyoyMDE4IE1VU0NMRSBTSE9BTFMgUFJPUEVSVFkgVEFYIFJFRkVSRU5EVU0XMjAxOCBNVU5JQ0lQQUwgRUxFQ1RJT04iMjAxOCBIRDIxIFNQRUNJQUwgR0VORVJBTCBFTEVDVElPThMyMDE4IEVMRUNUSU9OIENZQ0xFJDIwMTggQVVHVVNUIDI4VEggTVVOSUNJUEFMIEVMRUNUSU9OUy0yMDE3IFNQRUNJQUwgTVVOSUNJUEFMIEVMRUNUSU9OIChQSEVOSVggQ0lUWSk9MjAxNyBTRDI2IFNQRUNJQUwgUFJJTUFSWSBSVU5PRkYgQU5EIFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTiIyMDE3IFNEMjYgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OKzIwMTcgTVVOSUNJUEFMIFJVTk9GRiBFTEVDVElPTiAoVFVTQ0FMT09TQSkrMjAxNyBNVU5JQ0lQQUwgUlVOT0ZGIEVMRUNUSU9OIChCSVJNSU5HSEFNKSQyMDE3IE1VTklDSVBBTCBFTEVDVElPTiAoVFVTQ0FMT09TQSkgMjAxNyBNVU5JQ0lQQUwgRUxFQ1RJT04gKERPVEhBTiktMjAxNyBNVU5JQ0lQQUwgRUxFQ1RJT04gKEJJUk1JTkdIQU0gJiBNT0JJTEUpHjIwMTcgTUFESVNPTiBDT1VOVFkgUkVGRVJFTkRVTSIyMDE3IEhENjcgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OIjIwMTcgSEQ2NyBTUEVDSUFMIEdFTkVSQUwgRUxFQ1RJT04iMjAxNyBIRDU4IFNQRUNJQUwgUFJJTUFSWSBFTEVDVElPTjwyMDE3IEhENCBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEFORCBTUEVDSUFMIEdFTkVSQUwgRUxFQ1RJT04hMjAxNyBIRDQgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OHjIwMTcgQkFMRFdJTiBDT1VOVFkgUkVGRVJFTkRVTScyMDE2IFJFR1VMQVIgTVVOSUNJUEFMIFJVTk9GRiBFTEVDVElPTlMgMjAxNiBSRUdVTEFSIE1VTklDSVBBTCBFTEVDVElPTlMkMjAxNiBNVU5JQ0lQQUwgRUxFQ1RJT04gKEVOVEVSUFJJU0UpIjIwMTYgSEQ4MCBTUEVDSUFMIFBSSU1BUlkgRUxFQ1RJT04iMjAxNiBIRDc5IFNQRUNJQUwgUFJJTUFSWSBFTEVDVElPTiIyMDE2IEhENDEgU1BFQ0lBTCBHRU5FUkFMIEVMRUNUSU9OEzIwMTYgRUxFQ1RJT04gQ1lDTEUWMjAxNiBBTCBFTEVDVElPTiBDWUNMRTIyMDE1IE1VTklDSVBBTCBFTEVDVElPTiAoTU9OVEdPTUVSWSBBTkQgVEFMTEFERUdBKSAyMDE1IE1VTklDSVBBTCBFTEVDVElPTiAoQVRIRU5TKSgyMDE1IEpBQ0tTT04gQ09VTlRZIFNQRUNJQUwgVEFYIEVMRUNUSU9OKTIwMTUgSEQwNSBTUEVDSUFMIFBSSU1BUlkgUlVOT0ZGIEVMRUNUSU9OIjIwMTUgSEQwNSBTUEVDSUFMIFBSSU1BUlkgRUxFQ1RJT04iMjAxNSBIRDA1IFNQRUNJQUwgR0VORVJBTCBFTEVDVElPTicyMDE1IENPTEJFUlQgQ09VTlRZIFNDSE9PTCBUQVggRUxFQ1RJT04nMjAxNSBCQUxEV0lOIENPVU5UWSBTQ0hPT0wgVEFYIEVMRUNUSU9OEzIwMTQgRUxFQ1RJT04gQ1lDTEUnMjAxMyBSVU5PRkYgTVVOSUNJUEFMIEVMRUNUSU9OIChET1RIQU4pQDIwMTMgUlVOT0ZGIE1VTklDSVBBTCBFTEVDVElPTiAoQklSTUlOR0hBTSwgTU9CSUxFICYgVFVTQ0FMT09TQSkgMjAxMyBNVU5JQ0lQQUwgRUxFQ1RJT04gKERPVEhBTik5MjAxMyBNVU5JQ0lQQUwgRUxFQ1RJT04gKEJJUk1JTkdIQU0sIE1PQklMRSAmIFRVU0NBTE9PU0EpITIwMTMgSEQ3NCBTUEVDSUFMIFJVTk9GRiBFTEVDVElPTiIyMDEzIEhENzQgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OITIwMTMgSEQ1MyBTUEVDSUFMIFJVTk9GRiBFTEVDVElPTiIyMDEzIEhENTMgU1BFQ0lBTCBQUklNQVJZIEVMRUNUSU9OIjIwMTMgSEQ1MyBTUEVDSUFMIEdFTkVSQUwgRUxFQ1RJT04hMjAxMyBIRDMxIFNQRUNJQUwgUlVOT0ZGIEVMRUNUSU9OIjIwMTMgSEQzMSBTUEVDSUFMIFBSSU1BUlkgRUxFQ1RJT04iMjAxMyBIRDEwNCBTUEVDSUFMIFJVTk9GRiBFTEVDVElPTiMyMDEzIEhEMTA0IFNQRUNJQUwgUFJJTUFSWSBFTEVDVElPTiMyMDEzIEhEMTA0IFNQRUNJQUwgR0VORVJBTCBFTEVDVElPThVlATADMjMxAzIxNgMyMjUDMjI0AzIzMwMyMzADMjI5AzIyNwMyMjYDMjE3AzIzNAMyMTgDMjMyAzIyMwMyMjIDMjIxAzE4NwMyMTQDMjEzAzIxNQMyMTkDMTg4AzIxMgMyMTEDMjIwAzE5OQMxODYDMjA5AzIwMgMxOTADMTkxAzE4OQMxOTQDMTkzAzE5NQMyMDEDMjA1AzIwOAMxOTcDMjA2AzIwNAMxOTIDMjA3AzIwMAMyMDMDMjEwAzE5OAMxOTYDMTg0AzE4MQMxNzUDMTc2AzE2OQMxODIDMTc0AzE4MAMxNzMDMTcwAzE3MQMxNjQDMTY1AzE2NgMxNzgDMTYzAzE2OAMxNjcDMTc5AzE3MgMxNzcDMTYyAzE1OQMxNTYDMTU3AzE2MAMxNjEDMTQ0AzE1OAMxNDYDMTUxAzE1MwMxNTQDMTUyAzE1NQMxNDcDMTQ1AzEyOAMxMzIDMTMxAzEzMAMxMjkDMTM4AzEzMwMxNDIDMTM2AzE0MwMxNDEDMTM3AzEzOQMxMzUDMTQwFCsDZWdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnFgECNWRkAgMPFCsAAhAPFgYeDURhdGFUZXh0RmllbGQFC0Rlc2NyaXB0aW9uHg5EYXRhVmFsdWVGaWVsZAUMT2ZmaWNlQ29kZUlEHgtfIURhdGFCb3VuZGdkEBUpE1NlbGVjdCBhbiBPZmZpY2UuLi4WQVNTSVNUQU5UIFRBWCBBU1NFU1NPUhdBU1NJU1RBTlQgVEFYIENPTExFQ1RPUhBBVFRPUk5FWSBHRU5FUkFMDUNJUkNVSVQgQ0xFUksTQ0lSQ1VJVCBDT1VSVCBKVURHRShDT01NSVNTSU9ORVIgT0YgQUdSSUNVTFRVUkUgJiBJTkRVU1RSSUVTGUNPVU5UWSBCT0FSRCBPRiBFRFVDQVRJT04XQ09VTlRZIENPTU1JU1NJT04gQ0hBSVIbQ09VTlRZIENPTU1JU1NJT04gUFJFU0lERU5UE0NPVU5UWSBDT01NSVNTSU9ORVIQQ09VTlRZIENPTlNUQUJMRQ5DT1VOVFkgQ09ST05FUiJDT1VOVFkgU1VQRVJJTlRFTkRFTlQgT0YgRURVQ0FUSU9OEENPVU5UWSBUUkVBU1VSRVIcQ09VUlQgT0YgQ0lWSUwgQVBQRUFMUyBKVURHRR9DT1VSVCBPRiBDUklNSU5BTCBBUFBFQUxTIEpVREdFEERFUFVUWSBUUkVBU1VSRVIRRElTVFJJQ1QgQVRUT1JORVkURElTVFJJQ1QgQ09VUlQgSlVER0UIR09WRVJOT1IUTElDRU5TRSBDT01NSVNTSU9ORVIQTElDRU5TRSBESVJFQ1RPUgxMVC4gR09WRVJOT1IqUFJFU0lERU5UIE9GIFRIRSBQVUJMSUMgU0VSVklDRSBDT01NSVNTSU9ODVBST0JBVEUgSlVER0UZUFJPUEVSVFkgVEFYIENPTU1JU1NJT05FUhtQVUJMSUMgU0VSVklDRSBDT01NSVNTSU9ORVIUUkVWRU5VRSBDT01NSVNTSU9ORVISU0VDUkVUQVJZIE9GIFNUQVRFB1NIRVJJRkYNU1RBVEUgQVVESVRPUhhTVEFURSBCT0FSRCBPRiBFRFVDQVRJT04UU1RBVEUgUkVQUkVTRU5UQVRJVkUNU1RBVEUgU0VOQVRPUg9TVEFURSBUUkVBU1VSRVIfU1VQUkVNRSBDT1VSVCBBU1NPQ0lBVEUgSlVTVElDRRtTVVBSRU1FIENPVVJUIENISUVGIEpVU1RJQ0UMVEFYIEFTU0VTU09SFlRBWCBBU1NFU1NPUi9DT0xMRUNUT1INVEFYIENPTExFQ1RPUhUpATACNTkCNTgCMTYCMjkCMjgCMjECNTECNDcCNDgCNDYCNTUCNTACNTMCNDMCMjYCMjcCNTQCMjQCMjUCMTMCNDUCNTcCMTQCMjMCNDkCNTYCMjICNDQCMTUCMzgCMTgCMjACMTkCMzICMTcCMzECMzACNDACNDICNDEUKwMpZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2cWAQIhZGQCBQ8UKwACEA8WCB8JBQtEZXNjcmlwdGlvbh8KBQpEaXN0cmljdElEHwtnHgdFbmFibGVkZ2QQFWoYU2VsZWN0IGEgSnVyaXNkaWN0aW9uLi4uEEhPVVNFIERJU1RSSUNUIDEQSE9VU0UgRElTVFJJQ1QgMhBIT1VTRSBESVNUUklDVCAzEEhPVVNFIERJU1RSSUNUIDQQSE9VU0UgRElTVFJJQ1QgNRBIT1VTRSBESVNUUklDVCA2EEhPVVNFIERJU1RSSUNUIDcQSE9VU0UgRElTVFJJQ1QgOBBIT1VTRSBESVNUUklDVCA5EUhPVVNFIERJU1RSSUNUIDEwEUhPVVNFIERJU1RSSUNUIDExEUhPVVNFIERJU1RSSUNUIDEyEUhPVVNFIERJU1RSSUNUIDEzEUhPVVNFIERJU1RSSUNUIDE0EUhPVVNFIERJU1RSSUNUIDE1EUhPVVNFIERJU1RSSUNUIDE2EUhPVVNFIERJU1RSSUNUIDE3EUhPVVNFIERJU1RSSUNUIDE4EUhPVVNFIERJU1RSSUNUIDE5EUhPVVNFIERJU1RSSUNUIDIwEUhPVVNFIERJU1RSSUNUIDIxEUhPVVNFIERJU1RSSUNUIDIyEUhPVVNFIERJU1RSSUNUIDIzEUhPVVNFIERJU1RSSUNUIDI0EUhPVVNFIERJU1RSSUNUIDI1EUhPVVNFIERJU1RSSUNUIDI2EUhPVVNFIERJU1RSSUNUIDI3EUhPVVNFIERJU1RSSUNUIDI4EUhPVVNFIERJU1RSSUNUIDI5EUhPVVNFIERJU1RSSUNUIDMwEUhPVVNFIERJU1RSSUNUIDMxEUhPVVNFIERJU1RSSUNUIDMyEUhPVVNFIERJU1RSSUNUIDMzEUhPVVNFIERJU1RSSUNUIDM0EUhPVVNFIERJU1RSSUNUIDM1EUhPVVNFIERJU1RSSUNUIDM2EUhPVVNFIERJU1RSSUNUIDM3EUhPVVNFIERJU1RSSUNUIDM4EUhPVVNFIERJU1RSSUNUIDM5EUhPVVNFIERJU1RSSUNUIDQwEUhPVVNFIERJU1RSSUNUIDQxEUhPVVNFIERJU1RSSUNUIDQyEUhPVVNFIERJU1RSSUNUIDQzEUhPVVNFIERJU1RSSUNUIDQ0EUhPVVNFIERJU1RSSUNUIDQ1EUhPVVNFIERJU1RSSUNUIDQ2EUhPVVNFIERJU1RSSUNUIDQ3EUhPVVNFIERJU1RSSUNUIDQ4EUhPVVNFIERJU1RSSUNUIDQ5EUhPVVNFIERJU1RSSUNUIDUwEUhPVVNFIERJU1RSSUNUIDUxEUhPVVNFIERJU1RSSUNUIDUyEUhPVVNFIERJU1RSSUNUIDUzEUhPVVNFIERJU1RSSUNUIDU0EUhPVVNFIERJU1RSSUNUIDU1EUhPVVNFIERJU1RSSUNUIDU2EUhPVVNFIERJU1RSSUNUIDU3EUhPVVNFIERJU1RSSUNUIDU4EUhPVVNFIERJU1RSSUNUIDU5EUhPVVNFIERJU1RSSUNUIDYwEUhPVVNFIERJU1RSSUNUIDYxEUhPVVNFIERJU1RSSUNUIDYyEUhPVVNFIERJU1RSSUNUIDYzEUhPVVNFIERJU1RSSUNUIDY0EUhPVVNFIERJU1RSSUNUIDY1EUhPVVNFIERJU1RSSUNUIDY2EUhPVVNFIERJU1RSSUNUIDY3EUhPVVNFIERJU1RSSUNUIDY4EUhPVVNFIERJU1RSSUNUIDY5EUhPVVNFIERJU1RSSUNUIDcwEUhPVVNFIERJU1RSSUNUIDcxEUhPVVNFIERJU1RSSUNUIDcyEUhPVVNFIERJU1RSSUNUIDczEUhPVVNFIERJU1RSSUNUIDc0EUhPVVNFIERJU1RSSUNUIDc1EUhPVVNFIERJU1RSSUNUIDc2EUhPVVNFIERJU1RSSUNUIDc3EUhPVVNFIERJU1RSSUNUIDc4EUhPVVNFIERJU1RSSUNUIDc5EUhPVVNFIERJU1RSSUNUIDgwEUhPVVNFIERJU1RSSUNUIDgxEUhPVVNFIERJU1RSSUNUIDgyEUhPVVNFIERJU1RSSUNUIDgzEUhPVVNFIERJU1RSSUNUIDg0EUhPVVNFIERJU1RSSUNUIDg1EUhPVVNFIERJU1RSSUNUIDg2EUhPVVNFIERJU1RSSUNUIDg3EUhPVVNFIERJU1RSSUNUIDg4EUhPVVNFIERJU1RSSUNUIDg5EUhPVVNFIERJU1RSSUNUIDkwEUhPVVNFIERJU1RSSUNUIDkxEUhPVVNFIERJU1RSSUNUIDkyEUhPVVNFIERJU1RSSUNUIDkzEUhPVVNFIERJU1RSSUNUIDk0EUhPVVNFIERJU1RSSUNUIDk1EUhPVVNFIERJU1RSSUNUIDk2EUhPVVNFIERJU1RSSUNUIDk3EUhPVVNFIERJU1RSSUNUIDk4EUhPVVNFIERJU1RSSUNUIDk5EkhPVVNFIERJU1RSSUNUIDEwMBJIT1VTRSBESVNUUklDVCAxMDESSE9VU0UgRElTVFJJQ1QgMTAyEkhPVVNFIERJU1RSSUNUIDEwMxJIT1VTRSBESVNUUklDVCAxMDQSSE9VU0UgRElTVFJJQ1QgMTA1FWoBMAI0NAI0NQI0NgI0NwI0OAI0OQI1MQI1MAI1MgI1MwI1NAI1NQI1NgI1NwI1OAI1OQI2MAI2MQI2MgI2MwI2NAI2NQI2NgI2NwI2OAI2OQI3MAI3MQI3MgI3MwI3NAI3NQI3NgI3NwI3OAI3OQI4MAI4MQI4MgI4MwI4NAI4NQI4NgI4NwI4OAI4OQI5MAI5MQI5MgI5MwI5NAI5NQI5NgI5NwI5OAI5OQMxMDADMTAxAzEwMgMxMDMDMTA0AzEwNQMxMDYDMTA3AzEwOAMxMDkDMTEwAzExMQMxMTIDMTEzAzExNAMxMTUDMTE2AzExNwMxMTgDMTE5AzEyMAMxMjEDMTIyAzEyMwMxMjQDMTI1AzEyNgMxMjcDMTI4AzEyOQMxMzADMTMxAzEzMgMxMzMDMTM0AzEzNQMxMzYDMTM3AzEzOAMxNDADMTQxAzE0MgMxNDMDMTQ0AzE0NQMxNDYDMTQ3AzE0OAMxNDkUKwNqZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZxYBZmRkAgcPZBYEZg8QDxYKHwoFBkNvZGVJRB8JBQtEZXNjcmlwdGlvbh4FV2lkdGgbAAAAAADAckABAAAAHwtnHwQCgAJkEBUIFVNlbGVjdCBhbGwgcGFydGllcy4uLgxDb25zdGl0dXRpb24IRGVtb2NyYXQLSW5kZXBlbmRlbnQLTGliZXJ0YXJpYW4KUmVwdWJsaWNhbhJUaGUgUGVvcGxlJ3MgUGFydHkIV3JpdGUtSW4VCAItMQIyMAEyAjE5AjIyATUCMjMCMjEUKwMIZ2dnZ2dnZ2dkZAICDw8WBB8CBQEqHwxnZGQCCQ8UKwACEGQPFgpmAgECAgIDAgQCBQIGAgcCCAIJFgoQBQ5TZWxlY3QgWWVhci4uLgUBMGcQBQQyMDEzBQQyMDEzZxAFBDIwMTQFBDIwMTRnEAUEMjAxNQUEMjAxNWcQBQQyMDE2BQQyMDE2ZxAFBDIwMTcFBDIwMTdnEAUEMjAxOAUEMjAxOGcQBQQyMDE5BQQyMDE5ZxAFBDIwMjAFBDIwMjBnEAUEMjAyMQUEMjAyMWcWAWZkZAIBD2QWAgIhDxQrAAI8KwANADKaAwABAAAA/////wEAAAAAAAAADAIAAABGUUN1c3RvbUNvbnRyb2xzLCBWZXJzaW9uPTEuMC4wLjAsIEN1bHR1cmU9bmV1dHJhbCwgUHVibGljS2V5VG9rZW49bnVsbAUBAAAAL1FDdXN0b21Db250cm9scy5RR3JpZFZpZXdQYWdlZCtWaWV3U3RhdGVXcmFwcGVyBwAAACg8RGlzcGxheVBhZ2VTaXplRHJvcERvd24+a19fQmFja2luZ0ZpZWxkHzxEZWZhdWx0U29ydENvbD5rX19CYWNraW5nRmllbGQYPFNvcnRDb2w+a19fQmFja2luZ0ZpZWxkGDxTb3J0RGlyPmtfX0JhY2tpbmdGaWVsZBo8VG90YWxSb3dzPmtfX0JhY2tpbmdGaWVsZBo8UGFnZUluZGV4PmtfX0JhY2tpbmdGaWVsZBk8UGFnZVNpemU+a19fQmFja2luZ0ZpZWxkAAEBAQAAAAEICAgCAAAAAQYDAAAACENhbmROYW1lCQMAAAAGBAAAAANBU0MAAAAAAAAAAAoAAAALZBgBBR5fY3RsMDpDb250ZW50OmRnZFNlYXJjaFJlc3VsdHMPZ2T016mlvMQTTyrpdRA/B78F9I4trA==";

    const eventvalidation = callData.office === "STATE SENATOR" ? "/wEWygECpcKmtAsCn6+7nQYCupjZMgLI5+q7CAKbn9+aAQKSrfzsDAL3tNrxCgLM27xbAqHhmqwNAvCmwe8PArPF9HACvYaWmwYCkq347AwCvYaamwYCzNu4WwKI7NrFDgKGiP2xCwKh4Z6sDQKGiIGxCwKbn+OaAQK+hr6bBgLM28BaAqHhoqwNAve03vEKArPF+HACiez+xQ4ChoiFsQsCm5/nmgEC8KbF7w8CtMWYcAKTraDsDAKzxfxwAoaIibELAvGm6e8PApyfh5oBArTFnHACzdvgWgKi4cKvDQLotP7xCgKbn+uaAQL3tOLxCgKI7N7FDgK+hrqbBgKSrYDsDALM28RaAoeIpbELAr2GnpsGAvCmze8PAqHhpqwNAvCmye8PAons+sUOApOtnOwMAs3b5FoCnJ+LmgEC6LTG8QoCk63k7AwCtMXkcAKHiKmxCwLN26hbAvGm7e8PAqLhiqwNAvGmsewPApyfz5oBAs3brFsC6LTK8QoCk63o7AwCiezCxQ4CouGOrA0CiezGxQ4CvoaGmwYCtMXgcAKHiO2xCwK+hoKbBgKHiPGxCwK0xehwApOt7OwMAr6GipsGAvGmtewPApyf05oBAs3btFsCiezKxQ4Ck63w7AwCnJ/XmgECouGSrA0CzduwWwKHiPWxCwLotM7xCgK+ho6bBgLotNLxCgKJ7NbFDgKHiP2xCwKcn9+aAQLxpsHvDwK0xfRwAons0sUOAqLhmqwNAoeI+bELApOt9OwMAqLhlqwNApyf25oBAr6GkpsGArTF8HAC6LTW8QoC8aa97A8C3MaCmQECzKmo9w0C16mE9w0C16mI9w0C06nQ9A0C0qmE9w0C0qmI9w0C0qnk9A0C16nk9A0C0KnM9A0C0KmI9w0C0KnQ9A0C16nU9A0C16no9A0C16nc9A0C0Knc9A0C0qnQ9A0C0qnM9A0C16nY9A0C0qnY9A0C0qnU9A0C06nc9A0C0KnU9A0C16nM9A0C06nY9A0C0qnc9A0C0KmE9w0C16nQ9A0C0qng9A0C0KnY9A0C06nU9A0C0amI9w0C06mI9w0C0qno9A0C06mE9w0C0ang9A0C06nM9A0C0ank9A0C0ano9A0C0Kno9A0C0Kng9A0C0Knk9A0C9LeIxwoC87eIxwoC67fIxAoC67fExAoC67fAxAoC67f8xAoC67f4xAoC67f0xAoC67fwxAoC67fsxAoC67eoxwoC67ekxwoC6rfIxAoC6rfExAoC6rfAxAoC6rf8xAoC6rf4xAoC6rf0xAoC6rfwxAoC6rfsxAoC6reoxwoC6rekxwoC6bfIxAoC6bfExAoC6bfAxAoC6bf8xAoC6bf4xAoC6bf0xAoC6bfwxAoC6bfsxAoC6beoxwoC6bekxwoC6LfIxAoC6LfExAoC6LfAxAoC6Lf8xAoC55P9vgkC6pPxvgkC6pOxvQkC65OdvQkC6pP5vgkC75OxvQkC6pPFvgkC6pP9vgkCjvqr7AIC3YKuiQ4C3YKasgkC3YKGVwLdgvL7CwLdgt6cAwLdgor0AQLdgvaYCQLAlYiwCgLAlfTUBQLH3931AwLRgcyvBafx5YWLBDVqcfEfBc4ak+gdwKAt" : "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"
    request({
      uri:'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx',
      qs:{
        tb: 'politicalracesearch'
      },
      formData:{
        "_ctl0:Content:ddlElection":search_object.election,
        "_ctl0:Content:ddlOffice":search_object.office,
        " _ctl0:Content:ddlParty:ucddlParty":2,
        "_ctl0:Content:ddlDistrict":district,
        " _ctl0:Content:ddlYearToShow": callData.year,
        "_ctl0:Content:btnSearch": "Search",
        "__VIEWSTATE":viewstate,
        "__VIEWSTATEGENERATOR":"CE773A98",
        "__SCROLLPOSITIONX": 0,
        "__SCROLLPOSITIONY": 305.6000061035156,
        "__EVENTVALIDATION":eventvalidation
      },
      method:'POST',
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      },
      json:true
    }, (e,r,b)=>{
      if(e) return e;
      const $ = cheerio.load(b);
      const table = $('.table').text().split('\t\t\t\t')
      const table_arrays = table.map(x=>{
        return x.split('\n')
      })
      async.map(table_arrays,(array,cb)=>{
        let money_object = {}
        if(array[2]){
          money_object["name"] = array[2].trim();
          money_object["office"] = callData.office;
          money_object["state"] = "Alabama";
          money_object["district"] = callData.district;
          money_object["election_type"] = callData.election_type;
          money_object["election_year"] = callData.year;
          money_object["name_year"] = `${array[2].trim()}${callData.year}`
        }

        if(array[15]){
          money_object["contributions"] = array[15].trim().replace(/[^0-9.-]+/g,"")
        }
        if(array[19]){
          money_object["expenditures"] = array[19].trim().replace(/[^0-9.-]+/g,"")
          money_object["asOf"] = new Date()
        }
        if(money_object.name){
          return cb(null, money_object)
        } else {
          return cb(null, null)
        }
      },(e,r)=>{
        if(e) return e;
        const r_map = r.filter(x=>{
          if(x !== null){
            return x
          }
        })
        console.log("the r_map", r_map)
        return callback(null,r_map);
      })
    })
  })
}



// getSearchSettings({year:2018, office:"STATE SENATOR", party:"Democrat"})
const checkAllDistricts = function(callData, callback){
  function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
  }
  const district_numbers = callData.office === "STATE SENATOR" ? range(1,43) : range(44,149)
  async.mapSeries(district_numbers, (district,cb)=>{
    getCandidateMoney({year:callData.year, office:callData.office, district:district, election_type: callData.election_type}, (e,money_object)=>{
      if(e) return e;
      return cb(null, money_object);
    })
  },(e,r)=>{
    if(e) return callback(e);
    const money_array = []
    r.map(x=>{
      x.map(y=>{
        money_array.push(y);
      })
    })
    if(e) return e;
    return callback(null,money_array)
  })
}


const loadSenateData = async function(callData){
  await checkAllDistricts({year:callData.year, office:callData.office, election_type:callData.election_type}, (e,money_array)=>{
    if(e) return e;
    loader.loadFinanceArray(money_array);
    return money_array;
  })
}


loadSenateData({year:2018,office:"STATE REPRESENTATIVE", election_type:"General"})
// 'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx?tb=politicalracesearch'

// _ctl0:Content:ddlElection: 169
// _ctl0:Content:ddlOffice: 19
// _ctl0:Content:ddlDistrict: 46
// _ctl0:Content:ddlParty:ucddlParty: 2
// _ctl0:Content:ddlYearToShow: 0
// _ctl0:Content:btnSearch: Search
<<<<<<< HEAD

//need to redo Alabama with natural viewstate adaptations and auto redirects
=======
>>>>>>> 2c6391b65235303c4ca6ab8edcf8469ce3739dd5
