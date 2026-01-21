/**
 * Exemplo de Integração com o Backend HubSpot
 *
 * Este arquivo mostra como integrar seu sistema pessoal
 * com o HubSpot para adicionar opções dinamicamente.
 */

const axios = require('axios');

// Configuração
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const PROPERTY_NAME = 'status_cliente'; // Substitua pelo nome da sua propriedade
const OBJECT_TYPE = 'contacts'; // ou 'deals', 'companies', 'tickets'

/**
 * Cliente HTTP para comunicação com o backend
 */
const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

/**
 * Adiciona uma nova opção ao dropdown do HubSpot
 *
 * @param {string} nome - Nome legível da opção (ex: "Cliente Premium")
 * @param {string} valor - Valor interno (ex: "cliente_premium")
 * @returns {Promise<Object>} Resultado da operação
 */
async function adicionarOpcaoHubSpot(nome, valor) {
    try {
        console.log(`📤 Adicionando opção: ${nome} (${valor})`);

        const response = await api.post('/api/add-option', {
            name: nome,
            value: valor,
            objectType: OBJECT_TYPE,
            propertyName: PROPERTY_NAME
        });

        if (response.data.success) {
            console.log('✅ Opção adicionada com sucesso!');
            console.log('   Mensagem:', response.data.message);
            return response.data;
        } else {
            console.log('⚠️  Opção já existe ou erro:', response.data.message);
            return response.data;
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar opção:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Dados:', error.response.data);
        }
        throw error;
    }
}

/**
 * Sincroniza todas as opções do banco local com o HubSpot
 *
 * @returns {Promise<Object>} Resultado da sincronização
 */
async function sincronizarTodasOpcoes() {
    try {
        console.log('🔄 Sincronizando todas as opções...');

        const response = await api.post('/api/sync-to-hubspot', {
            objectType: OBJECT_TYPE,
            propertyName: PROPERTY_NAME
        });

        console.log('✅ Sincronização completa!');
        console.log('   Mensagem:', response.data.message);
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao sincronizar:', error.message);
        throw error;
    }
}

/**
 * Lista todas as opções salvas no banco de dados
 *
 * @returns {Promise<Array>} Lista de opções
 */
async function listarOpcoes() {
    try {
        const response = await api.get('/api/external-options');

        if (response.data.success) {
            const opcoes = response.data.data;
            console.log(`📊 Total de opções: ${opcoes.length}`);

            opcoes.forEach((opcao, index) => {
                console.log(`   ${index + 1}. ${opcao.name} (${opcao.value})`);
            });

            return opcoes;
        }

        return [];
    } catch (error) {
        console.error('❌ Erro ao listar opções:', error.message);
        throw error;
    }
}

/**
 * Busca opções diretamente do HubSpot
 *
 * @returns {Promise<Array>} Opções do HubSpot
 */
async function listarOpcoesHubSpot() {
    try {
        const response = await api.get('/api/hubspot-options', {
            data: {
                objectType: OBJECT_TYPE,
                propertyName: PROPERTY_NAME
            }
        });

        if (response.data.success) {
            const opcoes = response.data.options;
            console.log(`📊 Opções no HubSpot: ${opcoes.length}`);

            opcoes.forEach((opcao, index) => {
                console.log(`   ${index + 1}. ${opcao.label} (${opcao.value})`);
            });

            return opcoes;
        }

        return [];
    } catch (error) {
        console.error('❌ Erro ao buscar opções do HubSpot:', error.message);
        throw error;
    }
}

// ============================================================================
// EXEMPLOS DE USO
// ============================================================================

/**
 * EXEMPLO 1: Adicionar uma única opção
 */
async function exemplo1() {
    console.log('\n=== EXEMPLO 1: Adicionar opção única ===\n');

    await adicionarOpcaoHubSpot('Cliente Premium', 'cliente_premium');
}

/**
 * EXEMPLO 2: Adicionar múltiplas opções
 */
async function exemplo2() {
    console.log('\n=== EXEMPLO 2: Adicionar múltiplas opções ===\n');

    const opcoes = [
        { nome: 'Cliente Ativo', valor: 'cliente_ativo' },
        { nome: 'Cliente Inativo', valor: 'cliente_inativo' },
        { nome: 'Lead Qualificado', valor: 'lead_qualificado' },
        { nome: 'Prospect', valor: 'prospect' }
    ];

    for (const opcao of opcoes) {
        await adicionarOpcaoHubSpot(opcao.nome, opcao.valor);
        // Aguarda 500ms entre cada requisição para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

/**
 * EXEMPLO 3: Webhook - disparado quando algo acontece no seu sistema
 */
async function exemplo3_webhook(evento) {
    console.log('\n=== EXEMPLO 3: Webhook ===\n');
    console.log('Evento recebido:', evento);

    // Exemplo: Quando um cliente faz upgrade
    if (evento.tipo === 'upgrade_plano') {
        const nomeOpcao = `Plano ${evento.plano}`;
        const valorOpcao = `plano_${evento.plano.toLowerCase()}`;

        await adicionarOpcaoHubSpot(nomeOpcao, valorOpcao);
    }
}

/**
 * EXEMPLO 4: Integração com seu banco de dados
 */
async function exemplo4_integracao_db() {
    console.log('\n=== EXEMPLO 4: Integração com DB ===\n');

    // Simula buscar status do seu banco de dados
    const statusDoSeuSistema = [
        { id: 1, nome: 'Novo Cliente', ativo: true },
        { id: 2, nome: 'Cliente VIP', ativo: true },
        { id: 3, nome: 'Cliente Churn', ativo: false }
    ];

    // Adiciona apenas os status ativos
    for (const status of statusDoSeuSistema) {
        if (status.ativo) {
            const valor = status.nome.toLowerCase().replace(/\s+/g, '_');
            await adicionarOpcaoHubSpot(status.nome, valor);
        }
    }
}

/**
 * EXEMPLO 5: Sincronização completa
 */
async function exemplo5_sincronizacao() {
    console.log('\n=== EXEMPLO 5: Sincronização completa ===\n');

    // Lista o que está no banco local
    console.log('Opções no banco local:');
    await listarOpcoes();

    console.log('\n');

    // Sincroniza tudo com o HubSpot
    await sincronizarTodasOpcoes();

    console.log('\n');

    // Verifica o que está no HubSpot agora
    console.log('Opções no HubSpot após sincronização:');
    await listarOpcoesHubSpot();
}

/**
 * EXEMPLO 6: Tratamento de erros
 */
async function exemplo6_erro() {
    console.log('\n=== EXEMPLO 6: Tratamento de erros ===\n');

    try {
        // Tenta adicionar opção sem nome (deve falhar)
        await adicionarOpcaoHubSpot('', '');
    } catch (error) {
        console.log('✅ Erro capturado corretamente:', error.message);
    }

    try {
        // Tenta adicionar opção que já existe
        await adicionarOpcaoHubSpot('Cliente Premium', 'cliente_premium');
        await adicionarOpcaoHubSpot('Cliente Premium', 'cliente_premium'); // Duplicado
    } catch (error) {
        console.log('Erro ao adicionar duplicado:', error.message);
    }
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

async function main() {
    console.log('🚀 Iniciando exemplos de integração com HubSpot\n');
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Propriedade: ${PROPERTY_NAME}`);
    console.log(`Tipo de Objeto: ${OBJECT_TYPE}\n`);

    try {
        // Descomente o exemplo que você quer testar:

        // await exemplo1();
        // await exemplo2();
        // await exemplo3_webhook({ tipo: 'upgrade_plano', plano: 'Premium' });
        // await exemplo4_integracao_db();
        await exemplo5_sincronizacao();
        // await exemplo6_erro();

        console.log('\n✅ Exemplos executados com sucesso!');
    } catch (error) {
        console.error('\n❌ Erro na execução:', error.message);
        process.exit(1);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

// Exportar funções para usar em outros arquivos
module.exports = {
    adicionarOpcaoHubSpot,
    sincronizarTodasOpcoes,
    listarOpcoes,
    listarOpcoesHubSpot
};
