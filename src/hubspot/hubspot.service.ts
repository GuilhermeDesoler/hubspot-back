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
}
