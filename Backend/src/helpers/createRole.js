
import {v4 as uuidv4} from 'uuid';
import role from "../models/role.js";
import { enumRole } from './enum.js';

export const createRole= async ()=>{

    const roles = enumRole;

    for(let rolename of roles) {

        const roleExists = await role.findOne({
            where: {role_name: rolename}
        });

        if (!roleExists) {
            await role.create({
                id: uuidv4(),
                role_name: rolename
            });
            console.log(`Role ${rolename} created successfully.`);
        } else {
            console.log(`Role ${rolename} already exists.`);
        }
    }


};