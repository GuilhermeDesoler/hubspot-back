import { Controller, Post, Get, Body, HttpException, HttpStatus, Delete, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HubspotService } from './hubspot.service';
import { Option, OptionDocument } from '../database/schemas/option.schema';

@Controller('api')
export class HubspotController {
  constructor(
    private hubspotService: HubspotService,
    @InjectModel(Option.name) private optionModel: Model<OptionDocument>
  ) {}

  /**
   * Endpoint para adicionar uma opção
   * POST /api/add-option
   * Body: { name: string, value: string, objectType?: string, propertyName?: string }
   */
  @Post('add-option')
  async addOption(
    @Body() data: {
      name: string;
      value: string;
      objectType?: string;
      propertyName?: string;
    }
  ) {
    try {
      // Validação básica
      if (!data.name || !data.value) {
        throw new HttpException(
          'Nome e valor são obrigatórios',
          HttpStatus.BAD_REQUEST
        );
      }

      console.log('📝 Adicionando opção:', data);

      // Verifica se já existe no MongoDB
      const existing = await this.optionModel.findOne({ value: data.value }).exec();
      if (existing) {
        console.log('⚠️  Opção já existe no MongoDB:', existing);
        return {
          success: false,
          message: 'Opção já existe no banco de dados',
          data: existing
        };
      }

      // 1. Salva no MongoDB
      const newOption = new this.optionModel({
        name: data.name,
        value: data.value,
        objectType: data.objectType || process.env.DEFAULT_OBJECT_TYPE || 'contacts',
        propertyName: data.propertyName || process.env.DEFAULT_PROPERTY_NAME || 'sua_propriedade_customizada',
        synced: false
      });

      const savedOption = await newOption.save();
      console.log('✅ Opção salva no MongoDB:', savedOption);

      // 2. Sincroniza com HubSpot
      const hubspotResult = await this.hubspotService.addPropertyOption(
        { name: data.name, value: data.value },
        savedOption.objectType,
        savedOption.propertyName
      );

      // Atualiza flag de sincronização
      if (hubspotResult.success) {
        savedOption.synced = true;
        await savedOption.save();
        console.log('✅ Opção sincronizada com HubSpot');
      }

      return {
        success: true,
        message: 'Opção adicionada e sincronizada com sucesso',
        data: {
          mongodb: savedOption,
          hubspot: hubspotResult
        }
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar opção:', error);
      throw new HttpException(
        error.message || 'Erro ao adicionar opção',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para sincronizar todas as opções com o HubSpot
   * POST /api/sync-to-hubspot
   * Body: { objectType?: string, propertyName?: string }
   */
  @Post('sync-to-hubspot')
  async syncToHubspot(
    @Body() data?: {
      objectType?: string;
      propertyName?: string;
    }
  ) {
    try {
      const objectType = data?.objectType || process.env.DEFAULT_OBJECT_TYPE || 'contacts';
      const propertyName = data?.propertyName || process.env.DEFAULT_PROPERTY_NAME || 'sua_propriedade_customizada';

      console.log('🔄 Sincronizando opções com HubSpot...');
      console.log('   Object Type:', objectType);
      console.log('   Property Name:', propertyName);

      // Busca todas as opções do MongoDB
      const options = await this.optionModel.find({
        objectType,
        propertyName
      }).exec();

      if (!options || options.length === 0) {
        return {
          success: false,
          message: 'Nenhuma opção encontrada para sincronizar'
        };
      }

      console.log(`📊 Encontradas ${options.length} opções no MongoDB`);

      // Formata para HubSpot
      const formattedOptions = options.map(opt => ({
        name: opt.name,
        value: opt.value
      }));

      // Atualiza propriedade no HubSpot
      const result = await this.hubspotService.updatePropertyOptions(
        formattedOptions,
        objectType,
        propertyName
      );

      // Marca todas como sincronizadas
      await this.optionModel.updateMany(
        { objectType, propertyName },
        { synced: true }
      ).exec();

      console.log('✅ Sincronização completa!');

      return {
        success: true,
        message: `${options.length} opções sincronizadas com sucesso`,
        data: {
          count: options.length,
          options: formattedOptions,
          hubspotResult: result
        }
      };
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
      throw new HttpException(
        error.message || 'Erro ao sincronizar',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para atualizar formulários com as opções mais recentes
   * POST /api/update-forms
   * Body: { propertyName?: string }
   */
  @Post('update-forms')
  async updateForms(
    @Body() data?: {
      propertyName?: string;
    }
  ) {
    try {
      const propertyName = data?.propertyName || process.env.DEFAULT_PROPERTY_NAME || 'sua_propriedade_customizada';

      console.log('🔄 Atualizando formulários...');
      console.log('   Property Name:', propertyName);

      const result = await this.hubspotService.updateFormsWithProperty(propertyName);

      console.log(`✅ ${result.data.summary.updated} formulários atualizados!`);

      return result;
    } catch (error) {
      console.error('❌ Erro ao atualizar formulários:', error);
      throw new HttpException(
        error.message || 'Erro ao atualizar formulários',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para buscar opções do MongoDB
   * GET /api/external-options
   */
  @Get('external-options')
  async getExternalOptionsEndpoint() {
    try {
      const options = await this.optionModel.find().sort({ createdAt: -1 }).exec();

      console.log(`📊 ${options.length} opções no MongoDB`);

      return {
        success: true,
        count: options.length,
        data: options
      };
    } catch (error) {
      console.error('❌ Erro ao buscar opções:', error);
      throw new HttpException(
        'Erro ao buscar opções',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para buscar opções do HubSpot
   * GET /api/hubspot-options
   */
  @Get('hubspot-options')
  async getHubspotOptions() {
    try {
      const objectType = process.env.DEFAULT_OBJECT_TYPE || 'contacts';
      const propertyName = process.env.DEFAULT_PROPERTY_NAME || 'sua_propriedade_customizada';

      const result = await this.hubspotService.getPropertyOptions(
        objectType,
        propertyName
      );

      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar opções do HubSpot:', error);
      throw new HttpException(
        'Erro ao buscar opções do HubSpot',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para deletar uma opção
   * DELETE /api/options/:id
   */
  @Delete('options/:id')
  async deleteOption(@Param('id') id: string) {
    try {
      const option = await this.optionModel.findByIdAndDelete(id).exec();

      if (!option) {
        throw new HttpException('Opção não encontrada', HttpStatus.NOT_FOUND);
      }

      console.log('🗑️  Opção deletada:', option);

      return {
        success: true,
        message: 'Opção deletada com sucesso',
        data: option
      };
    } catch (error) {
      console.error('❌ Erro ao deletar opção:', error);
      throw new HttpException(
        error.message || 'Erro ao deletar opção',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para limpar todas as opções do MongoDB
   * DELETE /api/options/all
   */
  @Delete('options')
  async deleteAllOptions() {
    try {
      const result = await this.optionModel.deleteMany({}).exec();

      console.log(`🗑️  ${result.deletedCount} opções deletadas`);

      return {
        success: true,
        message: `${result.deletedCount} opções deletadas com sucesso`,
        data: { deletedCount: result.deletedCount }
      };
    } catch (error) {
      console.error('❌ Erro ao deletar opções:', error);
      throw new HttpException(
        'Erro ao deletar opções',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint de health check para verificar conexão com MongoDB
   * GET /api/health
   */
  @Get('health')
  async healthCheck() {
    try {
      const count = await this.optionModel.countDocuments().exec();

      return {
        success: true,
        message: 'Servidor rodando e conectado ao MongoDB',
        mongodb: {
          connected: true,
          optionsCount: count
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao conectar com MongoDB',
        error: error.message
      };
    }
  }
}
