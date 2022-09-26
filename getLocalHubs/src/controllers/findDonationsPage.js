import axios from 'axios';


async function getActBluePage(first_name, last_name){
    try{
        const url = `https://hubs-api.herokuapp.com/donations/${first_name}/${last_name}`;

        const results = await axios.request({
            url,
            method:'get'
        });
        const body = results.data;

        return body

    } catch(e) {
        console.log(e);
    }
}

export default getActBluePage