import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { nearid, eventid, qr } = req.query;
        const url = `https://testnet.vself.app/api/checkin/?eventid='${eventid}'&nearid='${nearid}'&qr='${qr}'`;    
        const result = await axios(url);
        res.status(200).json(result.data);
    } catch(err) {
        console.log(err);
    }
}