// Executa os cenários da atividade em uma única rota GET.
// Uso: node cenarios.js <rota> <usuarios> <repeticoes> <rampa-em-segundos>
// Exemplo: node cenarios.js /api/chamados 20 10 10

const http = require('http');

const ROTA = process.argv[2] || '/api/chamados';
const USUARIOS = Number(process.argv[3] || 1);
const REPETICOES = Number(process.argv[4] || 10);
const RAMPA_S = Number(process.argv[5] || 1);
const HOST = process.env.HOST || 'localhost';
const PORTA = Number(process.env.PORTA || 3333);
const agente = new http.Agent({ keepAlive: true, maxSockets: 1000 });

function requisicao() {
  return new Promise(resolve => {
    const inicio = process.hrtime.bigint();
    const req = http.request({ host: HOST, port: PORTA, path: ROTA, method: 'GET', agent: agente }, res => {
      res.resume();
      res.on('end', () => resolve({
        ms: Number(process.hrtime.bigint() - inicio) / 1e6,
        ok: res.statusCode === 200,
        status: res.statusCode
      }));
    });
    req.on('error', erro => resolve({
      ms: Number(process.hrtime.bigint() - inicio) / 1e6,
      ok: false,
      status: 0,
      erro: erro.message
    }));
    req.end();
  });
}

async function usuarioVirtual(indice) {
  await new Promise(resolve => setTimeout(resolve, (RAMPA_S * 1000 / USUARIOS) * indice));
  const resultados = [];
  for (let i = 0; i < REPETICOES; i++) resultados.push(await requisicao());
  return resultados;
}

function percentil90(valores) {
  const ordenados = [...valores].sort((a, b) => a - b);
  return ordenados[Math.max(0, Math.ceil(ordenados.length * 0.9) - 1)];
}

(async () => {
  const inicio = Date.now();
  const listas = await Promise.all([...Array(USUARIOS)].map((_, i) => usuarioVirtual(i)));
  const resultados = listas.flat();
  const duracao = (Date.now() - inicio) / 1000;
  const tempos = resultados.map(x => x.ms);
  const saida = {
    rota: ROTA,
    usuarios: USUARIOS,
    repeticoes: REPETICOES,
    rampaSegundos: RAMPA_S,
    amostras: resultados.length,
    mediaMs: Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length),
    p90Ms: Math.round(percentil90(tempos)),
    maxMs: Math.round(Math.max(...tempos)),
    erroPercentual: Number((resultados.filter(x => !x.ok).length / resultados.length * 100).toFixed(1)),
    vazaoReqS: Number((resultados.length / duracao).toFixed(1)),
    codigosHttp: [...new Set(resultados.map(x => x.status))].sort((a, b) => a - b),
    atendeAtividade: resultados.every(x => x.ok) && tempos.reduce((a, b) => a + b, 0) / tempos.length <= 500
  };
  console.log(JSON.stringify(saida));
  agente.destroy();
})();
