import axios from 'axios' 
import * as dotenv from 'dotenv' 
dotenv.config()


export default async function getSuggestions(){
  try{
    const base_url = 'https://hubs-api.herokuapp.com/'
    const res = await axios.get(`${base_url}suggestion/pennsylvania`)
    return res['data']
  } catch(e) {
    console.log(e);
  }

}


