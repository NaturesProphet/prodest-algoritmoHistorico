import { geraPontos, geraPontosPorItinerario } from "./libs/dicionarios";
import { getTable } from "./database/estatico/sql-server";
import { Viagem } from "./models/viagem.model";
import { Historico } from "models/historico.model";
const fs = require( 'fs' );




async function main () {
    // 1.1
    let viagensBanco = await getTable( 'viagem' );
    // 1.2
    let dicionarioPontos = await geraPontos();
    // 1.3 + 1.4 + 1.5
    let dicionarioItinerario = await geraPontosPorItinerario();
    // 2.1
    let estimativas = new Array();

    //2.2.0
    console.log( '\n\n\n\nIniciando o algoritmo...\n' );
    for ( let viagemIndex = 0; viagemIndex < viagensBanco.length; viagemIndex++ ) {
        //2.2.1
        let viagem: Viagem = new Viagem();
        viagem.id_viagem = viagensBanco[ viagemIndex ].id;
        viagem.rotulo = viagensBanco[ viagemIndex ].veiculo;
        viagem.data_i = new Date( viagensBanco[ viagemIndex ].horadasaida ).getTime();
        viagem.data_f = new Date( viagensBanco[ viagemIndex ].horadachegada ).getTime();
        viagem.itinerario_id = viagensBanco[ viagemIndex ].id;
        //2.2.2
        viagem.historico = new Array();
        //2.2.3
        let listaPontosItinerario = dicionarioItinerario[ viagensBanco[ viagemIndex ].id ];

        if ( listaPontosItinerario != undefined ) {
            //2.2.3.1
            for ( let listaIndex = 0; listaIndex < listaPontosItinerario.length; listaIndex++ ) {
                //2.2.3.2
                let historico = new Historico();
                historico.ordem = listaPontosItinerario[ listaIndex ].ordem;
                historico.ponto_id = listaPontosItinerario[ listaIndex ].ponto_id;



                //..
                //..
                //..
                //2.2.3.6
                viagem.historico.push( historico );
            }
        } //2.2.4

        //2.2.3.6
        estimativas.push( viagem );

    } //2.2

    // 2.3
    console.log( 'Escrevendo o resultado no arquivo <estimativas.json> ...' );
    await fs.writeFileSync( 'estimativas.json', JSON.stringify( estimativas, null, 2 ) );
    console.log( '\nAlgoritmo concluído com sucesso. arquivo <estimativas.json> gerado.\n' );
}


main();