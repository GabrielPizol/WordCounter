import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command()

//configurar entradas do programa
program
    .version ('0.0.1')
    .option ('-t, --texto <string>', 'Caminho para o arquivo de texto a ser processado')
    .option ('-d --destino <string>', 'Caminho da pasta para o arquivo com o resultado')
    .action ((options) => {
        const {texto, destino} = options;

        if (!texto || !destino){
            console.error(chalk.red('ERRO, favor inserir caminho de origem e destino!'));
            program.help();
            return;
        }

        const caminhoTexto = path.resolve(texto);
        const caminhoDestino = path.resolve(destino);

        try{
            processarArquivo(caminhoTexto, caminhoDestino);
            console.log(chalk.green('Arquivo processado!'));
        } catch (erro) {
            console.log('Ocorreu um erro no processamento');
        }
    })

    program.parse();

//processar o arquivo
function processarArquivo(texto, destino) {
    fs.readFile(texto, 'utf-8', (erro, texto) => {
        try {
            if (erro) throw erro
            const resultado = contaPalavras(texto);
            criaESalvaArquivo(resultado, destino);
        } catch (erro) {
            resolveErros(erro)
        }
    })
}

//criar e salvar o arquivo
async function criaESalvaArquivo(listaPalavras, endereco) {
    const arquivoNovo = `${endereco}/resultado.txt`;
    const textoPalavras = montaSaidaArquivo(listaPalavras);
    try {
        await fs.promises.writeFile(arquivoNovo, textoPalavras);
        console.log('Arquivo criado!')
    } catch(erro) {
        throw erro;
    }
}

//contar as palavras 
function contaPalavras(texto){
    const paragrafo = separaParagrafos(texto);
    const contagemPalavras = paragrafo.flatMap((paragrafo) => {
        if (!paragrafo) return [];
        return verificaPalavrasDuplicadas(paragrafo)
    })
    return contagemPalavras;
}

//separar em paragrafos
function separaParagrafos(texto) {
    return texto.toLowerCase().split('\n');
}

//montar saida
function montaSaidaArquivo(listaPalavras) {
    let textoFinal = '';
    listaPalavras.forEach((paragrafo, indice) => {
        const duplicadas = filtraDuplicadas(paragrafo).join(', ');
        if(duplicadas){
            textoFinal += `Palavras duplicadas no paragrafo ${indice + 1}: ${duplicadas} \n`
        }
    })

    return textoFinal;
}

function resolveErros(erro){
    if (erro.code === 'ENOENT') {
        throw new Error ('Arquivo nao encontrado!')
    } else {
        return 'Erro na aplicação!';
    }
}

function verificaPalavrasDuplicadas(texto) {
    const listaPalavra = texto.split(' ');
    const resultado = {};
    listaPalavra.forEach(palavra => {
        if (palavra.length >= 3) {
            const palavraLimpa = limpaPalavras(palavra);
            resultado[palavraLimpa] = (resultado[palavraLimpa] || 0) + 1
        }
    })

    return resultado;
}

//filtra palavras duplicadas
function filtraDuplicadas(paragrafo) {
    return Object.keys(paragrafo).filter(chave => paragrafo[chave] > 1)
  }

function limpaPalavras(palavra) {
    return palavra.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  }