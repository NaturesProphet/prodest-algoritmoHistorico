import { OMaisPertoDe, VeiculosProximos } from "./geolib";



export function calculaFaixa ( rotulo: string, data_i: number, data_f: number, p0, pF, historico ) {

    let intervalo = ( data_f - data_i ) / 2; // adição de metade do tempo de viagem previsto

    let dataInicialMinima = data_i - intervalo;
    let dataInicialMaxima = data_i + intervalo;
    let dataFinalMinima = data_f - intervalo;
    let dataFinalmaxima = data_f + intervalo;



    let horarioInicioBruto = VeiculosProximos( rotulo, p0, historico );
    let horarioInicioFiltrado = new Array();

    for ( let index = 0; index < horarioInicioBruto.length; index++ ) {
        let datahora = horarioInicioBruto[ index ].DATAHORA;
        if ( datahora > dataInicialMinima && datahora < dataInicialMaxima ) {
            horarioInicioFiltrado.push( horarioInicioBruto[ index ] );
        }
    }
    let HorarioInicialReal: number;
    let key: number = OMaisPertoDe( p0, horarioInicioFiltrado );
    if ( key != undefined ) {
        HorarioInicialReal = horarioInicioFiltrado[ key ].DATAHORA;
    } else {
        // console.log( `O veículo ${rotulo} não foi encontrado dentro do intervalo inicial da viagem` );
    }


    //s1.5
    let horarioFinalBruto = VeiculosProximos( rotulo, pF, historico );
    let horarioFinalFiltrado = new Array();

    for ( let index = 0; index < horarioFinalBruto.length; index++ ) {
        let datahora = horarioFinalBruto[ index ].DATAHORA;
        if ( datahora > dataFinalMinima && datahora < dataFinalmaxima ) {
            horarioFinalFiltrado.push( horarioFinalBruto[ index ] );
        }
    }
    let HorarioFinalReal: number;
    let key2: number = OMaisPertoDe( pF, horarioFinalFiltrado );
    if ( key2 != undefined ) {
        HorarioFinalReal = horarioFinalFiltrado[ key2 ].DATAHORA;
    } else {
        //console.log( `O veículo ${rotulo} não foi encontrado dentro do intervalo final da viagem` );
    }
    if ( key != undefined && key2 != undefined ) {
        return [ HorarioInicialReal, HorarioFinalReal ];
    }
    return undefined;
}









export function getHorario ( ponto, rotulo: string, faixa: number[], historico: [] ) {
    if ( faixa == undefined ) {
        return 0;
    }
    let horarios = VeiculosProximos( rotulo, ponto, historico );
    let horariosValidos = new Array();
    for ( let index = 0; index < horarios.length; index++ ) {
        let datahora = horarios[ index ].DATAHORA;
        if ( datahora > faixa[ 0 ] && datahora < faixa[ 1 ] ) {
            horariosValidos.push( horarios[ index ] );
        }
    }
    let maisPerto = OMaisPertoDe( ponto, horariosValidos );
    if ( maisPerto != undefined ) {
        return maisPerto.DATAHORA;
    } else {
        return 0;
    }
}
