# Algoritmo Histórico do Realtime
Algoritmo desenvolvido para gerar estimativas sobre os horarios em que cada ônibus passa em cada ponto durante cada uma das viagens de seu itinerario. Alimentado por dados do banco estático em sql-server e do banco de histórico de 24 horas do sistema realtime em MongoDB.

## Variaveis de ambiente
```bash
TRANSCOLDB_USER
TRANSCOLDB_PASSWORD
TRANSCOLDB_HOST
TRANSCOLDB_SCHEMA
TRANSCOLDB_PORT
MONGO_HOST
MONGO_PORT
MONGO_USER
MONGO_PASSWORD
MONGO_SCHEMA
RAIO_BUSCA
```

## Executar
Direto:
```bash
npm start                                       # compila e executa o js em um comando só
```
via node call (compilar o typescript e chamar o main.js)
```bash
npm run prestart:prod                           # Compila o js
node dist/main.js                               # executa o js compilado
```

## FONTE DE DADOS

Viagens ---> tabela do banco estatico
```
id_viagem           # viagem.id
rotulo              # viagem.veiculo
data_i              # viagem.horadasaida
data_f              # viagem.horadachegada
itinerario_id       # viagem.itinerario.id
```
---

Historico: mongodb ---> realtime/historico/veiculos

pontos ---> tabela do banco estatico

itinerario_ponto ---> tabela do banco estatico
```
ponto_id            # itinerario_ponto.ponto_id
ordem               # itinerario_ponto.ordem
data_hora           # historico.DATAHORA
```
---


## LOGS DE EXECUÇÃO E ERROS
Após a execução do algoritmo, consulte os logs de erro e de execução na pasta ./logs


## ARQUIVO "estimativas.json"
O arquivo gerado pelo algoritmo estará na pasta raiz do repositório.

## TEMPO DE EXECUÇÃO ESTIMADO

Em um pc mediano, com 12 GB de ram e um dual core de terceira geração, espera-se um tempo em torno de 38 minutos para cada mil viagens a serem processadas. 

( baseado em testes ).