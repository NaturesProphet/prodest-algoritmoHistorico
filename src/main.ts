import { geraPontos, geraPontosPorItinerario } from "./libs/dicionarios";
import { getTable } from "./database/estatico/sql-server";




async function main () {
    // 1.1
    let viagensBanco = await getTable( 'viagem' );
    // 1.2
    let dicionarioPontos = await geraPontos();
    // 1.3 + 1.4
    let dicionarioItinerario = await geraPontosPorItinerario();


}





main();