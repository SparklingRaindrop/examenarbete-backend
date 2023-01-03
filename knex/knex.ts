import knex from 'knex';
const environment = process.env.NODE_ENV || 'development'; // eslint-disable-line
import config from '../knexfile';
export default knex(config[environment]);