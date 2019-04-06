const mssqlUser: string = process.env.TRANSCOLDB_USER || 'SA';
const mssqlPassword: string = process.env.TRANSCOLDB_PASSWORD || 'Senh@Dif1cil';
const mssqlHost: string = process.env.TRANSCOLDB_HOST || 'localhost';
const mssqlSchema: string = process.env.TRANSCOLDB_SCHEMA || 'DadosBasicosCETURB';
const mssqlPort: number = Number( process.env.TRANSCOLDB_PORT ) || 1433;

const mssqlConnectionString: string =
    `mssql://${mssqlUser}:${mssqlPassword}@${mssqlHost}:${mssqlPort}/${mssqlSchema}`;

export { mssqlConnectionString };