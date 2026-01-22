import { Injectable } from '@nestjs/common';
import { Client } from '@hubspot/api-client';

interface OptionData {
  name: string;
  value: string;
}

@Injectable()
export class HubspotService {
  private hubspot: Client;

  constructor() {
    this.hubspot = new Client({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN
    });
  }

  /**
   * Atualiza as opções de uma propriedade customizada no HubSpot
   * @param options Array de opções para adicionar/atualizar
   * @param objectType Tipo do objeto (contacts, deals, companies, etc)
   * @param propertyName Nome da propriedade customizada
   */
  async updatePropertyOptions(
    options: OptionData[],
    objectType: string = 'contacts',
    propertyName: string = 'sua_propriedade_customizada'
  ) {
    try {
      const formattedOptions = options.map(opt => ({
        label: opt.name,
        value: opt.value,
        hidden: false
      }));

      await this.hubspot.crm.properties.coreApi.update(
        objectType,
        propertyName,
        {
          options: formattedOptions
        }
      );

      return { success: true, message: 'Opções atualizadas com sucesso no HubSpot' };
    } catch (error) {
      console.error('Erro ao atualizar opções no HubSpot:', error);
      throw new Error(`Falha ao atualizar HubSpot: ${error.message}`);
    }
  }

  /**
   * Adiciona uma única opção à propriedade existente
   * @param option Dados da opção a ser adicionada
   * @param objectType Tipo do objeto
   * @param propertyName Nome da propriedade
   */
  async addPropertyOption(
    option: OptionData,
    objectType: string = 'contacts',
    propertyName: string = 'sua_propriedade_customizada'
  ) {
    try {
      // Primeiro, busca as opções existentes
      const property = await this.hubspot.crm.properties.coreApi.getByName(
        objectType,
        propertyName
      );

      const existingOptions = property.options || [];

      // Verifica se a opção já existe
      const optionExists = existingOptions.some(
        opt => opt.value === option.value
      );

      if (optionExists) {
        return {
          success: false,
          message: 'Opção já existe na propriedade'
        };
      }

      // Adiciona a nova opção às existentes
      const updatedOptions = [
        ...existingOptions,
        {
          label: option.name,
          value: option.value,
          hidden: false
        }
      ];

      await this.hubspot.crm.properties.coreApi.update(
        objectType,
        propertyName,
        {
          options: updatedOptions
        }
      );

      return {
        success: true,
        message: 'Opção adicionada com sucesso ao HubSpot'
      };
    } catch (error) {
      console.error('Erro ao adicionar opção no HubSpot:', error);
      throw new Error(`Falha ao adicionar opção: ${error.message}`);
    }
  }

  /**
   * Busca todas as opções de uma propriedade
   */
  async getPropertyOptions(
    objectType: string = 'contacts',
    propertyName: string = 'sua_propriedade_customizada'
  ) {
    try {
      const property = await this.hubspot.crm.properties.coreApi.getByName(
        objectType,
        propertyName
      );

      return {
        success: true,
        options: property.options || []
      };
    } catch (error) {
      console.error('Erro ao buscar opções do HubSpot:', error);
      throw new Error(`Falha ao buscar opções: ${error.message}`);
    }
  }

  /**
   * Atualiza todos os formulários que usam uma propriedade específica
   * Usa API v3 diretamente via HTTP para evitar restrições do SDK
   */
  async updateFormsWithProperty(
    propertyName: string = 'sua_propriedade_customizada'
  ) {
    try {
      console.log(`🔄 Buscando formulários que usam a propriedade: ${propertyName}`);

      const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

      // 1. Buscar todos os formulários via API v3
      const formsResponse = await fetch('https://api.hubapi.com/marketing/v3/forms', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!formsResponse.ok) {
        const errorText = await formsResponse.text();
        throw new Error(`Erro ao buscar formulários: ${formsResponse.status} - ${errorText}`);
      }

      const formsData = await formsResponse.json();
      const forms = formsData.results || [];

      console.log(`📋 Encontrados ${forms.length} formulários`);

      const updatedForms = [];
      const skippedForms = [];

      // 2. Buscar opções atualizadas da propriedade
      const propertyData = await this.hubspot.crm.properties.coreApi.getByName(
        'contacts',
        propertyName
      );
      const currentOptions = propertyData.options || [];

      // 3. Para cada formulário, verificar se usa a propriedade
      for (const form of forms) {
        try {
          // Verificar se o formulário tem o campo
          let hasProperty = false;

          for (const group of form.fieldGroups || []) {
            for (const field of group.fields || []) {
              if (field.name === propertyName) {
                hasProperty = true;
                break;
              }
            }
            if (hasProperty) break;
          }

          if (!hasProperty) {
            skippedForms.push({
              id: form.id,
              name: form.name,
              reason: 'Não usa a propriedade'
            });
            continue;
          }

          // 4. Atualizar apenas o campo específico mantendo estrutura original
          const updatedGroups = form.fieldGroups.map((group: any) => ({
            ...group,
            fields: group.fields.map((field: any) => {
              if (field.name === propertyName) {
                return {
                  ...field,
                  options: currentOptions.map(opt => ({
                    label: opt.label,
                    value: opt.value,
                    displayOrder: opt.displayOrder || -1,
                    hidden: opt.hidden || false
                  }))
                };
              }
              return field;
            })
          }));

          // 5. Fazer PATCH via API v3 diretamente
          const updateResponse = await fetch(`https://api.hubapi.com/marketing/v3/forms/${form.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fieldGroups: updatedGroups
            })
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`${updateResponse.status} - ${errorText}`);
          }

          updatedForms.push({
            id: form.id,
            name: form.name,
            optionsCount: currentOptions.length
          });

          console.log(`✅ Formulário "${form.name}" atualizado com ${currentOptions.length} opções`);

        } catch (error) {
          console.error(`❌ Erro ao atualizar formulário ${form.id}:`, error.message);
          skippedForms.push({
            id: form.id,
            name: form.name,
            reason: `Erro: ${error.message}`
          });
        }
      }

      return {
        success: true,
        message: `${updatedForms.length} formulários atualizados`,
        data: {
          updated: updatedForms,
          skipped: skippedForms,
          summary: {
            total: forms.length,
            updated: updatedForms.length,
            skipped: skippedForms.length
          }
        }
      };

    } catch (error) {
      console.error('Erro ao atualizar formulários:', error);
      throw new Error(`Falha ao atualizar formulários: ${error.message}`);
    }
  }
}
