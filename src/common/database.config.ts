const mssqlUser: string = process.env.TRANSCOLDB_USER || 'SA';
const mssqlPassword: string = process.env.TRANSCOLDB_PASSWORD || 'Senh@Dif1cil';
const mssqlHost: string = process.env.TRANSCOLDB_HOST || 'localhost';
const mssqlSchema: string = process.env.TRANSCOLDB_SCHEMA || 'DadosBasicosCETURB';
const mssqlPort: number = Number( process.env.TRANSCOLDB_PORT ) || 1433;

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = Number( process.env.MONGO_PORT ) || 27017;
const mongoUser = process.env.MONGO_USER || 'admin';
const mongoPassword = process.env.MONGO_PASSWORD || 'admin123';
const mongoSchema = process.env.MONGO_SCHEMA || 'historico';
const mongoConf: string = '?authSource=admin';

const mssqlConnectionString: string =
    `mssql://${mssqlUser}:${mssqlPassword}@${mssqlHost}:${mssqlPort}/${mssqlSchema}`;

const mongoConnectionString: string =
    `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoSchema}${mongoConf}`;

export { mssqlConnectionString, mongoConnectionString, mongoSchema };